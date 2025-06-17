// src/inventory/inventory.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    const records = await this.inventoryRepo.find({
      where: { variantId },
      order: { createdAt: 'DESC' },
    });
    return records;
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

  async adjustStock(dto: InventoryActionDto, manager: EntityManager) {
    const inventory = await manager.findOne(Inventory, {
      where: { id: dto.inventoryId },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    inventory.remainingQuantity += dto.quantity;
    await manager.save(inventory);
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

  async returnBadStock(dto: ReturnOrderDto, manager: EntityManager) {
    for (const item of dto.items) {
      await manager.save(InventoryTransaction, {
        variantId: item.variantId,
        productId: item.productId,
        importBatchId: null,
        transactionType: InventoryTransactionType.RETURN,
        quantity: item.quantity,
        price: 0,
        note: `Return from Order ${dto.orderId}`,
      });
    }
  }

  async bulkAction(dto: InventoryBulkDto, type: InventoryTransactionType) {
    await this.dataSource.transaction(async (manager) => {
      for (const item of dto.data) {
        const variant = await manager.findOne(ProductVariant, {
          where: { id: item.variantId },
        });

        if (!variant) {
          throw new BadRequestException(`Variant ${item.variantId} not found`);
        }

        let inventory = await manager.findOne(Inventory, {
          where: { variantId: item.variantId },
        });

        if (!inventory) {
          inventory = manager.create(Inventory, {
            variantId: item.variantId,
            productId: variant.productId,
            stockQuantity: 0,
          });
          await manager.save(inventory);
        }

        // Ghi log transaction
        const transaction = this.transactionRepo.create({
          variantId: item.variantId,
          productId: variant.productId,
          transactionType: type,
          quantity: item.quantity,
          price: item.price,
          note: dto.note,
        });

        manager.save(transaction);
        // Thực hiện update tồn kho
        if (type === InventoryTransactionType.EXPORT) {
          if (inventory.remainingQuantity < item.quantity)
            throw new BadRequestException();
          inventory.remainingQuantity -= item.quantity;
        } else {
          inventory.remainingQuantity += item.quantity;
        }

        manager.save(inventory);
      }
    });
  }

  async createImportBatch(dto: ImportBatchDto) {
    await this.dataSource.transaction(async (manager) => {
      const importBatch = await manager.save(ImportBatch, dto);

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
    });
  }

  async extractFromExcel(
    file: Express.Multer.File,
  ): Promise<InventoryActionDto[]> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: InventoryActionDto[] = XLSX.utils.sheet_to_json(worksheet);

    const invalidRows = jsonData.filter(
      (item) =>
        !item.variantId || !item.productId || !item.quantity || !item.price,
    );
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

  async getLowStockProductsByProduct(threshold: number = 10) {
    const query = this.dataSource
      .getRepository(Inventory)
      .createQueryBuilder('batch')
      .leftJoin(Product, 'product', 'product.id = batch.productId')
      .select('batch.productId', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(batch.remainingQuantity)', 'totalStock')
      .groupBy('batch.productId')
      .addGroupBy('product.name')
      .having('SUM(batch.remainingQuantity) <= :threshold', { threshold })
      .orderBy('totalStock', 'ASC');

    const raw = await query.getRawMany();

    return raw.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalStock: Number(item.totalStock),
    }));
  }
}
