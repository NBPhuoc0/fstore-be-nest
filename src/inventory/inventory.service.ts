// src/inventory/inventory.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import e from 'express';
import { OrderStatus } from 'src/common/enums';
import {
  ImportBatchDto,
  InventoryActionDto,
  InventoryBulkDto,
} from 'src/dto/req/inventory.dto';
import { ReturnOrderDto } from 'src/dto/req/return-order.dto';
import {
  ImportBatch,
  Inventory,
  Order,
  Product,
  ProductVariant,
} from 'src/entities';
import {
  InventoryTransaction,
  InventoryTransactionType,
} from 'src/entities/inventory-transaction.entity';
import { Repository, DataSource, In, MoreThan, EntityManager } from 'typeorm';
import * as XLSX from 'xlsx';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(InventoryTransaction)
    private readonly transactionRepo: Repository<InventoryTransaction>,

    @InjectRepository(ImportBatch)
    private readonly importBatchRepo: Repository<ImportBatch>,

    private readonly dataSource: DataSource,
  ) {}

  logger = new Logger(InventoryService.name);

  async getStockByVariant(variantId: number): Promise<Inventory[] | null> {
    const qr = this.dataSource.createQueryBuilder();
    qr.select('inv.*', 'inventory');
    qr.addSelect('batch.note', 'note');
    qr.from(Inventory, 'inv');
    qr.leftJoin(ImportBatch, 'batch', 'inv.importBatchId = batch.id');
    qr.where('inv.variantId = :variantId', { variantId });

    return qr.getRawMany();
  }

  async getStockByProduct(productId: number): Promise<Inventory[] | null> {
    const records = await this.inventoryRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
    return records;
  }

  async getOldestAvailableStockByVariant(
    variantId: number,
  ): Promise<Inventory | null> {
    return this.inventoryRepo.findOne({
      where: {
        variantId,
        remainingQuantity: MoreThan(0),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async getTransactionByVariant(variantId: number) {
    return this.transactionRepo.find({
      where: { variantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactionByProduct(productId: number) {
    return this.transactionRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactionByOrder(orderId: number) {
    return this.transactionRepo.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactionByBatch(batchId: number) {
    return this.transactionRepo.find({
      where: { importBatchId: batchId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactionList() {
    return this.transactionRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getInventoryList() {
    return this.inventoryRepo.find({});
  }

  async getInventoryByVariant(variantId: number) {
    const inventory = await this.inventoryRepo.findOneBy({ variantId });
    if (!inventory) {
      throw new NotFoundException('Không tìm thấy kho hàng cho biến thể này');
    }
    return inventory;
  }

  async getListImportBatch() {
    return this.importBatchRepo.find({});
  }

  async getImportBatchDetail(id: number) {
    const batch = await this.importBatchRepo.findOne({
      where: { id },
    });
    const items = await this.inventoryRepo.find({
      where: { importBatchId: id },
      // relations: ['variant'],
    });
    return { batch, items };
  }

  async getInventoryByVariantIds(variantIds: number[]) {
    return this.inventoryRepo.findBy({ variantId: In(variantIds) });
  }

  async exportStock(dto: InventoryActionDto, manager: EntityManager) {
    const inventories = await manager.find(Inventory, {
      where: {
        variantId: dto.variantId,
        productId: dto.productId,
        remainingQuantity: MoreThan(0),
      },
      order: { createdAt: 'ASC' },
    });

    let quantityLeft = dto.quantity;

    for (const inv of inventories) {
      if (quantityLeft === 0) break;

      const deductQty = Math.min(quantityLeft, inv.remainingQuantity);
      inv.remainingQuantity -= deductQty;
      await manager.save(inv);

      await manager.save(InventoryTransaction, {
        variantId: dto.variantId,
        productId: dto.productId,
        importBatchId: inv.importBatchId,
        orderId: dto.orderId,
        transactionType: InventoryTransactionType.EXPORT,
        quantity: deductQty,
        price: dto.price,
        note: dto.note,
      });

      quantityLeft -= deductQty;
    }

    if (quantityLeft > 0) {
      throw new BadRequestException(
        'Không đủ tồn kho của sản phẩm ' +
          dto.productId +
          ' mẫu ' +
          dto.variantId,
      );
    }
  }

  async returnGoodStock(orderId: number, manager: EntityManager) {
    const transactions = await manager.find(InventoryTransaction, {
      where: {
        transactionType: InventoryTransactionType.EXPORT,
        orderId: orderId,
      },
    });

    for (const trx of transactions) {
      await manager.increment(
        Inventory,
        {
          variantId: trx.variantId,
          productId: trx.productId,
          importBatchId: trx.importBatchId,
        },
        'remainingQuantity',
        trx.quantity,
      );

      await manager.save(InventoryTransaction, {
        variantId: trx.variantId,
        productId: trx.productId,
        importBatchId: trx.importBatchId,
        orderId: orderId,
        transactionType: InventoryTransactionType.RETURN,
        quantity: trx.quantity,
        price: trx.price,
        note: `Order ID ${orderId} cancelled`,
      });
    }
  }

  async adjustStock(dto: InventoryActionDto) {
    const inventory = await this.inventoryRepo.findOne({
      where: { id: dto.inventoryId },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    inventory.remainingQuantity += dto.quantity;
    await this.inventoryRepo.save(inventory);
  }

  async exchangeStock(
    dto: ReturnOrderDto,
    manager: EntityManager,
  ): Promise<void> {
    for (const item of dto.items) {
      const inventories = await manager.find(Inventory, {
        where: { variantId: item.variantId, remainingQuantity: MoreThan(0) },
        order: { createdAt: 'ASC' },
      });

      let quantityLeft = item.quantity;
      for (const inv of inventories) {
        if (quantityLeft === 0) break;

        const deductQty = Math.min(quantityLeft, inv.remainingQuantity);
        inv.remainingQuantity -= deductQty;
        await manager.save(inv);

        await manager.save(InventoryTransaction, {
          variantId: item.variantId,
          productId: inv.productId,
          importBatchId: inv.importBatchId,
          transactionType: InventoryTransactionType.EXPORT,
          quantity: deductQty,
          price: 0,
          note: `Exchange: Order ID ${dto.orderId} `,
        });

        quantityLeft -= deductQty;
      }
    }
  }

  async returnBadStock(order: Order, manager: EntityManager) {
    for (const item of order.orderItems) {
      await manager.save(InventoryTransaction, {
        variantId: item.variantId,
        productId: item.productId,
        importBatchId: null,
        transactionType: InventoryTransactionType.RETURN,
        quantity: item.quantity,
        price: 0,
        note: `Return from Order ${order.id}`,
      });
    }
  }

  // async bulkAction(dto: InventoryBulkDto, type: InventoryTransactionType) {
  //   await this.dataSource.transaction(async (manager) => {
  //     for (const item of dto.data) {
  //       let inventory = await manager.findOne(Inventory, {
  //         where: {
  //           id: item.inventoryId,
  //           variantId: item.variantId,
  //           productId: item.productId,
  //         },
  //       });

  //       if (!inventory) {
  //         if (
  //           type == InventoryTransactionType.ADJUST ||
  //           type == InventoryTransactionType.RETURN
  //         ) {
  //           throw new NotFoundException(
  //             `Inventory ${item.inventoryId} not found`,
  //           );
  //         }
  //         inventory = manager.create(Inventory, {
  //           variantId: item.variantId,
  //           productId: item.productId,
  //           stockQuantity: 0,
  //         });
  //         await manager.save(inventory);
  //       }

  //       // Ghi log transaction
  //       const transaction = manager.create(InventoryTransaction, {
  //         variantId: item.variantId,
  //         productId: item.productId,
  //         transactionType: type,
  //         quantity: item.quantity,
  //         price: item.price,
  //         note: dto.note,
  //       });

  //       manager.save(transaction);
  //       // Thực hiện update tồn kho
  //       if (type === InventoryTransactionType.EXPORT) {
  //         if (inventory.remainingQuantity < item.quantity)
  //           throw new BadRequestException();
  //         inventory.remainingQuantity -= item.quantity;
  //       } else {
  //         inventory.remainingQuantity += item.quantity;
  //       }

  //       manager.save(inventory);
  //     }
  //   });
  // }

  async bulkAdjust(dto: InventoryBulkDto) {
    await this.dataSource.transaction(async (manager) => {
      for (const item of dto.data) {
        const inventory = await manager.findOne(Inventory, {
          where: {
            id: item.inventoryId,
            variantId: item.variantId,
            productId: item.productId,
          },
        });

        if (!inventory) {
          throw new NotFoundException(
            `Inventory ${item.inventoryId} not found`,
          );
        }

        // Ghi log transaction
        const transaction = manager.create(InventoryTransaction, {
          variantId: item.variantId,
          productId: item.productId,
          transactionType: InventoryTransactionType.ADJUST,
          quantity: item.quantity,
          price: item.price,
          note: dto.note,
        });

        await manager.save(transaction);

        // Thực hiện update tồn kho
        inventory.remainingQuantity += item.quantity;
        await manager.save(inventory);
      }
    });
  }

  async createImportBatch(dto: ImportBatchDto) {
    await this.dataSource.transaction(async (manager) => {
      const importBatch = manager.create(ImportBatch, {
        supplierName: dto.supplierName,
        note: dto.note,
        incidentalCosts: dto.incidentalCosts || 0,
        createdBy: dto.createdBy,
      });
      await manager.save(importBatch);

      let totalCost = 0;
      if (dto.incidentalCosts) {
        totalCost = dto.incidentalCosts;
      }

      for (const item of dto.items) {
        const variant = await manager.findOne(ProductVariant, {
          where: { id: item.variantId, productId: item.productId },
        });
        if (!variant) {
          throw new BadRequestException(`Variant ${item.variantId} not found`);
        }

        // this.logger.log(importBatch.id);

        const inventoryAction = manager.create(Inventory, {
          variantId: item.variantId,
          productId: item.productId,
          remainingQuantity: item.quantity,
          quantity: item.quantity,
          importBatchId: importBatch.id,
          price: item.price,
        });

        const transaction = manager.create(InventoryTransaction, {
          variantId: item.variantId,
          productId: item.productId,
          importBatchId: importBatch.id,
          transactionType: InventoryTransactionType.IMPORT,
          quantity: item.quantity,
          price: item.price,
          note: 'nhập kho lô hàng ' + importBatch.id,
        });
        await manager.save(transaction);

        await manager.save(inventoryAction);

        totalCost += item.quantity * (item.price || 0);
      }

      importBatch.totalCost += totalCost;
      await manager.save(importBatch);
    });
  }

  async extractFromExcel(
    file: Express.Multer.File,
    adjust: boolean = false,
  ): Promise<InventoryActionDto[]> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: InventoryActionDto[] = XLSX.utils.sheet_to_json(worksheet);
    let invalidRows = [];
    if (adjust) {
      invalidRows = jsonData.filter(
        (item) =>
          !item.inventoryId ||
          !item.variantId ||
          !item.productId ||
          !item.quantity,
      );
    } else {
      invalidRows = jsonData.filter(
        (item) =>
          !item.variantId || !item.productId || !item.quantity || !item.price,
      );
    }

    if (invalidRows.length > 0) {
      throw new BadRequestException(
        'File import thiếu thông tin ở một số dòng',
      );
    }
    return jsonData;
  }

  async getDailyRevenueByMonth(year: number, month: number) {
    const query = this.dataSource
      .getRepository(InventoryTransaction)
      .createQueryBuilder('trx')
      .where('trx.transactionType = :type', {
        type: InventoryTransactionType.EXPORT,
      })
      .andWhere('EXTRACT(YEAR FROM trx.createdAt) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM trx.createdAt) = :month', { month })
      .select("TO_CHAR(trx.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(trx.quantity * trx.price)', 'totalRevenue')
      .groupBy("TO_CHAR(trx.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC');

    const raw = await query.getRawMany();

    return raw.map((item) => ({
      date: item.date,
      totalRevenue: parseFloat(item.totalRevenue),
    }));
  }

  async getRevenueByBatch() {
    const query = this.dataSource
      .getRepository(InventoryTransaction)
      .createQueryBuilder('trx')
      .where('trx.transactionType = :type', {
        type: InventoryTransactionType.EXPORT,
      })
      .select('trx.batchId', 'batchId')
      .addSelect('SUM(trx.quantity * trx.price)', 'totalRevenue')
      .groupBy('trx.batchId');

    const raw = await query.getRawMany();

    return raw.map((item) => ({
      batchId: item.batchId,
      revenue: Number(item.totalRevenue),
    }));
  }

  async getLowStockProducts(threshold = 10) {
    const result = await this.dataSource
      .getRepository(Product)
      .createQueryBuilder('p')
      .leftJoin('product_variants', 'v', 'v.product_id = p.id')
      .leftJoin('inventories', 'i', 'i.variant_id = v.id')
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('COALESCE(SUM(i.remain_quantity), 0)', 'totalQuantity')
      .groupBy('p.id')
      .addGroupBy('p.name')
      .having('COALESCE(SUM(i.remain_quantity), 0) < :threshold', {
        threshold,
      })
      .orderBy('p.id', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      productId: +r.productId,
      name: r.productName,
      totalQuantity: +r.totalQuantity,
    }));
  }

  async getBatchDetailWithRevenueV1(batchId: number) {
    // Lấy thông tin batch
    const batch = await this.importBatchRepo.findOne({
      where: { id: batchId },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    // Lấy tất cả transaction export của batch này
    const exportTransactions = await this.transactionRepo.find({
      where: {
        importBatchId: batchId,
        transactionType: InventoryTransactionType.EXPORT,
      },
    });

    if (exportTransactions.length === 0) {
      return {
        batch,
        actualRevenue: 0,
        expectedRevenue: 0,
        exportTransactions: [],
      };
    }

    // Lấy danh sách orderId liên quan
    const orderIds = exportTransactions
      .map((trx) => trx.orderId)
      .filter((id) => !!id);

    let orders: Order[] = [];
    if (orderIds.length > 0) {
      orders = await this.dataSource
        .getRepository(Order)
        .findBy({ id: In(orderIds) });
    }

    // Map orderId -> status
    const orderStatusMap = new Map<number, OrderStatus>();
    for (const order of orders) {
      orderStatusMap.set(order.id, order.status);
    }

    // Tính doanh thu thực và dự kiến
    let actualRevenue = 0;
    let expectedRevenue = 0;

    for (const trx of exportTransactions) {
      const status = orderStatusMap.get(trx.orderId);
      const revenue = Number(trx.quantity) * Number(trx.price || 0);

      if (
        status === OrderStatus.CANCELLED ||
        status === OrderStatus.EXCHANGED
      ) {
        actualRevenue += revenue;
      } else {
        expectedRevenue += revenue;
      }
    }

    return {
      batch,
      actualRevenue,
      expectedRevenue,
      exportTransactions,
    };
  }

  async getBatchRevenueSummary(batchId: number) {
    // 1. Lấy thông tin batch
    const batch = await this.dataSource
      .getRepository(ImportBatch)
      .findOne({ where: { id: batchId } });

    if (!batch) throw new NotFoundException('Batch not found');

    const completedStatuses = ['COMPLETED', 'EXCHANGE'];

    // 2. Doanh thu thực tế
    const realRevenueRaw = await this.dataSource
      .getRepository(InventoryTransaction)
      .createQueryBuilder('t')
      .leftJoin(Order, 'o', 'o.id = t.orderId')
      .select('SUM(t.price * t.quantity)', 'realRevenue')
      .where('t.importBatchId = :batchId', { batchId })
      .andWhere('t.transactionType = :type', { type: 'EXPORT' })
      .andWhere('o.status IN (:...statuses)', { statuses: completedStatuses })
      .getRawOne();

    // 3. Doanh thu dự kiến
    const expectedRevenueRaw = await this.dataSource
      .getRepository(InventoryTransaction)
      .createQueryBuilder('t')
      .leftJoin(Order, 'o', 'o.id = t.orderId')
      .select('SUM(t.price * t.quantity)', 'expectedRevenue')
      .where('t.importBatchId = :batchId', { batchId })
      .andWhere('t.transactionType = :type', { type: 'EXPORT' })
      .andWhere('o.status NOT IN (:...statuses)', {
        statuses: [...completedStatuses, 'CANCELLED'],
      })
      .getRawOne();

    // 4. Tổng hàng đã nhập + còn lại
    const inventoryRaw = await this.dataSource
      .getRepository(Inventory)
      .createQueryBuilder('i')
      .select('SUM(i.quantity)', 'totalImported')
      .addSelect('SUM(i.remainingQuantity)', 'totalRemaining')
      .where('i.importBatchId = :batchId', { batchId })
      .getRawOne();

    return {
      batch,
      realRevenue: Number(realRevenueRaw.realRevenue) || 0,
      expectedRevenue: Number(expectedRevenueRaw.expectedRevenue) || 0,
      totalImported: Number(inventoryRaw.totalImported) || 0,
      totalRemaining: Number(inventoryRaw.totalRemaining) || 0,
    };
  }
}
