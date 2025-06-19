import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderPaymentMethod, OrderStatus, VoucherType } from 'src/common/enums';
import { CreateOrderDtov1 } from 'src/dto/req/create-order-v1.dto';
import { CreateOrderDtov2 } from 'src/dto/req/create-order-v2.dto';
import {
  Cart,
  CartItem,
  Inventory,
  Order,
  OrderItem,
  Product,
  ProductVariant,
  Voucher,
} from 'src/entities';
import { ProductService } from 'src/product/services/product.service';
import { Between, DataSource, In, Repository } from 'typeorm';
import { PaymentService } from './payment.service';
import { DailyRevenue } from 'src/common/types';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { InventoryService } from 'src/inventory/inventory.service';
import { ReturnOrderDto } from 'src/dto/req/return-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private dataSource: DataSource,
    private readonly inventoryService: InventoryService,
    // private readonly PaymentService: PaymentService,
  ) {}

  logger = new Logger(OrderService.name);

  async completeOrderMock() {}

  async createOrderMock(dto: CreateOrderDtov1): Promise<Order> {
    const cart = dto.cart;

    return await this.dataSource.transaction(async (manager) => {
      const order = new Order();
      let subTotal = 0;
      let discount = 0;

      order.name = dto.name;
      order.email = dto.email;
      order.address = dto.address;
      order.phone = dto.phone;
      order.paymentMethod = dto.paymentMethod;

      const orderItems = await Promise.all(
        cart.map(async (cartItem) => {
          const orderItem = OrderItem.create();

          const variant = await manager.findOne(ProductVariant, {
            where: { id: cartItem.variantId },
            relations: ['product'],
          });
          if (!variant)
            throw new BadRequestException('Product variant not found');

          orderItem.product = variant.product;
          orderItem.productId = variant.productId;
          orderItem.variantId = cartItem.variantId;
          orderItem.quantity = cartItem.quantity;

          if (variant.product.salePrice) {
            discount +=
              (variant.product.originalPrice - variant.product.salePrice) *
              cartItem.quantity;
          }
          subTotal += variant.product.originalPrice * cartItem.quantity;

          return orderItem;
        }),
      );

      order.orderItems = orderItems;

      if (dto.voucherId) {
        const voucher = await manager.findOne(Voucher, {
          where: { id: dto.voucherId },
        });
        if (!voucher) throw new BadRequestException('Voucher not found');
        if (!voucher.status) {
          throw new BadRequestException('Voucher is not active');
        }
        if (voucher.usedQuantity >= voucher.quantity) {
          throw new BadRequestException('Voucher has been used up');
        }

        if (voucher.type === VoucherType.AMOUNT) {
          discount += voucher.value;
        } else if (voucher.type === VoucherType.PERCENT) {
          discount += (subTotal * voucher.value) / 100;
          if (voucher.maxDiscount) {
            discount = Math.min(discount, voucher.maxDiscount);
          }
        }
        this.logger.log(
          `Applying voucher ${voucher.id} with discount: ${discount}`,
        );

        voucher.usedQuantity += 1;
        voucher.budgetUsed += discount;
        await manager.save(voucher);
        order.voucherId = voucher.id;
      }

      // km shipping
      if (subTotal > 500000) {
        discount += 20000;
      }

      order.subTotal = subTotal;
      order.discount = discount;
      order.total = subTotal - discount;

      if (dto.paymentMethod === 'COD') {
        order.status = OrderStatus.PROCESSING;
      }

      order.createdAt = dto.createdAt;
      order.status = OrderStatus.COMPLETED;
      await manager.save(order);
      const orderId = await manager.getId(order);

      for (const item of orderItems) {
        await manager.increment(
          Product,
          { id: item.productId },
          'saleCount',
          item.quantity,
        );

        await this.inventoryService.exportStock(
          {
            variantId: item.variantId,
            productId: item.productId,
            orderId: orderId,
            quantity: item.quantity,
            price: item.product.originalPrice,
            note: `Sale: Order ID ${orderId}`,
          },
          manager,
        );
      }

      return order;
    });
  }

  async createOrderv2(dto: CreateOrderDtov2): Promise<Order> {
    const cart = dto.cart;

    return await this.dataSource.transaction(async (manager) => {
      const order = new Order();
      let subTotal = 0;
      let discount = 0;

      order.name = dto.name;
      order.email = dto.email;
      order.address = dto.address;
      order.phone = dto.phone;
      order.paymentMethod = dto.paymentMethod;

      const orderItems = await Promise.all(
        cart.map(async (cartItem) => {
          const orderItem = OrderItem.create();

          const product = await manager.findOne(Product, {
            where: { id: cartItem.productId },
          });
          if (!product) throw new BadRequestException('Product not found');

          const variant = await manager.findOne(ProductVariant, {
            where: { id: cartItem.variantId },
          });
          if (!variant)
            throw new BadRequestException('Product variant not found');

          orderItem.product = product;
          orderItem.productId = cartItem.productId;
          orderItem.variantId = cartItem.variantId;
          orderItem.quantity = cartItem.quantity;

          if (product.salePrice) {
            discount +=
              (product.originalPrice - product.salePrice) * cartItem.quantity;
          }
          subTotal += product.originalPrice * cartItem.quantity;

          return orderItem;
        }),
      );

      order.orderItems = orderItems;

      if (dto.voucherId) {
        const voucher = await manager.findOne(Voucher, {
          where: { id: dto.voucherId },
        });
        if (!voucher) throw new BadRequestException('Voucher not found');
        if (!voucher.status) {
          throw new BadRequestException('Voucher is not active');
        }
        if (voucher.usedQuantity >= voucher.quantity) {
          throw new BadRequestException('Voucher has been used up');
        }
        if (voucher.fromValue && subTotal < voucher.fromValue) {
          throw new BadRequestException(
            `Voucher requires minimum order value of ${voucher.fromValue}`,
          );
        }

        if (voucher.type === VoucherType.AMOUNT) {
          discount += voucher.value;
        } else if (voucher.type === VoucherType.PERCENT) {
          discount += (subTotal * voucher.value) / 100;
          if (voucher.maxDiscount) {
            discount = Math.min(discount, voucher.maxDiscount);
          }
        }
        this.logger.log(
          `Applying voucher ${voucher.id} with discount: ${discount}`,
        );

        voucher.usedQuantity += 1;
        voucher.budgetUsed += discount;
        await manager.save(voucher);
        order.voucherId = voucher.id;
      }

      // km shipping
      if (subTotal > 500000) {
        discount += 20000;
      }

      order.subTotal = subTotal;
      order.discount = discount;
      order.total = subTotal - discount;

      if (dto.paymentMethod === 'COD') {
        order.status = OrderStatus.PROCESSING;
      }

      await manager.save(order);
      const orderId = await manager.getId(order);

      for (const item of orderItems) {
        await manager.increment(
          Product,
          { id: item.productId },
          'saleCount',
          item.quantity,
        );

        await this.inventoryService.exportStock(
          {
            variantId: item.variantId,
            productId: item.productId,
            orderId: orderId,
            quantity: item.quantity,
            price: item.product.originalPrice,
            note: `Sale: Order ID ${orderId}`,
          },
          manager,
        );
      }

      return order;
    });
  }

  async updatePaymentReference(order: Order, ref: string): Promise<Order> {
    order.paymentRef = ref;
    return Order.save(order);
  }

  updateShippingOrderCode(
    res: Order,
    shippingOrderCode: any,
  ): Order | PromiseLike<Order> {
    res.shippingRef = shippingOrderCode.data.order_code;
    res.shippingFee = shippingOrderCode.data.total_fee;
    res.total += shippingOrderCode.data.total_fee;
    return Order.save(res);
  }

  async confirmOrderPay(id: number): Promise<Order> {
    const order = await Order.findOneBy({ id });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    order.status = OrderStatus.PROCESSING;
    return Order.save(order);
  }

  async confirmOrderDelivered(id: number): Promise<Order> {
    const order = await Order.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'orderItems.variant'],
    });
    if (!order) {
      throw new BadRequestException('Order not found ');
    }
    if (order.status == OrderStatus.PROCESSING) {
      order.status = OrderStatus.DELIVERING;
      return Order.save(order);
    }
    throw new BadRequestException('Order was canceled or delivered already');
  }

  async cancelUncompletedOrder(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: id },
        relations: ['orderItems'],
      });

      if (!order) throw new NotFoundException('Order not found');

      if (
        order.status === OrderStatus.PROCESSING ||
        order.status === OrderStatus.DELIVERING ||
        order.status === OrderStatus.PENDING
      ) {
        this.logger.log(
          `Cancelling order with ID ${id} and status ${order.status}`,
        );
        await this.inventoryService.returnGoodStock(id, manager);
        order.returnReason = 'Order cancelled before completion';
        // Update order status
        order.status = OrderStatus.CANCELLED;
        if (order.paymentMethod === OrderPaymentMethod.BANKING) {
          order.status = OrderStatus.WAITING_REFUND;
        }
        // Update product sale count
        for (const item of order.orderItems) {
          await manager.decrement(
            Product,
            { id: item.productId },
            'saleCount',
            item.quantity,
          );
        }

        // Update voucher used quantity and budget used
        if (order.voucherId) {
          const voucher = await manager.findOne(Voucher, {
            where: { id: order.voucherId },
          });
          if (voucher) {
            voucher.usedQuantity -= 1;
            voucher.budgetUsed -= order.discount;
            await manager.save(voucher);
          }
        }
        return await manager.save(order);
      }
      throw new BadRequestException('Order cannot be cancelled');
    });
  }

  async refundOrder(id: number): Promise<Order> {
    const order = await Order.findOne({
      where: { id },
    });
    if (!order) {
      throw new BadRequestException('Order not found or cannot be refunded');
    }
    if (order.status !== OrderStatus.WAITING_REFUND) {
      throw new BadRequestException(
        'Order was not waiting for refund, cannot be refunded',
      );
    }
    order.status = OrderStatus.CANCELLED;
    return Order.save(order);
  }

  async completeOrder(id: number): Promise<Order> {
    const order = await Order.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    if (order.status !== OrderStatus.DELIVERING) {
      throw new BadRequestException(
        'Order was not delivered, cannot be completed',
      );
    }
    order.status = OrderStatus.COMPLETED;
    return Order.save(order);
  }

  async returnOrderRequest(id: number): Promise<Order> {
    const order = await Order.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        'Order was completed, cannot request return',
      );
    }
    order.status = OrderStatus.RETURN_PROCESSING;
    return Order.save(order);
  }

  async returnOrderProcessing(id: number): Promise<Order> {
    const order = await Order.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    if (order.status !== OrderStatus.RETURN_PROCESSING) {
      throw new BadRequestException('Order was not in return processing');
    }
    order.status = OrderStatus.RETURNED;
    return Order.save(order);
  }

  async exchangeOrder(dto: ReturnOrderDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: dto.orderId },
        relations: ['orderItems'],
      });
      if (!order) {
        throw new BadRequestException('Order not found');
      }

      const orderItemMap = new Map<number, OrderItem>();
      for (const orderItem of order.orderItems) {
        orderItemMap.set(orderItem.variantId, orderItem);
      }

      for (const item of dto.items) {
        const orderItem = orderItemMap.get(item.variantId);
        if (!orderItem) {
          throw new BadRequestException(
            `Variant ID ${item.variantId} not found in original order`,
          );
        }

        if (item.quantity > orderItem.quantity) {
          throw new BadRequestException(
            `Return quantity for variant ID ${item.variantId} exceeds purchased quantity`,
          );
        }
      }

      if (order.status !== OrderStatus.RETURNED) {
        throw new BadRequestException(
          'Order was not returned, cannot request exchange',
        );
      }
      await this.inventoryService.exchangeStock(dto, manager);
      order.status = OrderStatus.EXCHANGED;
      return manager.save(order);
    });
  }

  async cancelCompletedOrder(dto: ReturnOrderDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: dto.orderId },
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      if (order.orderItems.length != dto.items.length) {
        throw new BadRequestException('Invalid return items');
      }

      const orderItemMap = new Map<number, OrderItem>();
      for (const orderItem of order.orderItems) {
        orderItemMap.set(orderItem.variantId, orderItem);
      }

      for (const item of dto.items) {
        const orderItem = orderItemMap.get(item.variantId);
        if (!orderItem) {
          throw new BadRequestException(
            `Variant ID ${item.variantId} not found in original order`,
          );
        }

        if (item.quantity != orderItem.quantity) {
          throw new BadRequestException(
            `Return quantity for variant ID ${item.variantId} does not match purchased quantity`,
          );
        }
      }

      if (order.status !== OrderStatus.RETURNED) {
        throw new BadRequestException(
          'Order was not returned, cannot cancel return',
        );
      }

      if (dto.reason) {
        order.returnReason = dto.reason;
      } else {
        order.returnReason = 'Order cancelled by user';
      }

      // await this.inventoryService.cancelReturnStock(order.id, manager);
      await this.inventoryService.returnBadStock(dto, manager);

      if (order.voucherId) {
        const voucher = await manager.findOne(Voucher, {
          where: { id: order.voucherId },
        });
        if (voucher) {
          voucher.usedQuantity -= 1;
          voucher.budgetUsed -= order.discount;
          await manager.save(voucher);
        }
      }

      order.status = OrderStatus.CANCELLED;
      await manager.save(order);
    });
  }

  async getOrderById(id: number): Promise<Order> {
    return Order.findOne({
      where: { id },
      relations: [
        'orderItems',
        'orderItems.product',
        'orderItems.variant',
        'orderItems.variant.color',
      ],
    });
  }

  // async getOrdersByUserId(userId: number): Promise<Order[]> {
  //   return Order.find({
  //     where: { userId },
  //     relations: ['orderItems'],
  //   });
  // }

  async getOrders(y?: number, m?: number): Promise<Order[]> {
    const whereConditions: any = {};
    if (y && m) {
      const startOfMonth = new Date(y, m - 1, 1);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59);
      whereConditions.createdAt = Between(startOfMonth, endOfMonth);
    } else if (y) {
      const startOfYear = new Date(y, 0, 1);
      const endOfYear = new Date(y + 1, 0, 1, 0, 0, 0);
      whereConditions.createdAt = Between(startOfYear, endOfYear);
    }

    return Order.find({
      relations: ['orderItems', 'orderItems.product', 'orderItems.variant'],
      where: whereConditions,
    });
  }

  async deleteOrder(order: Order) {
    await Order.delete(order.id);
  }

  async getTodayOrdersByGroup(): Promise<{
    fail: Order[];
    completed: Order[];
    processing: Order[];
  }> {
    const failStatuses = [OrderStatus.CANCELLED];
    const completedStatuses = [OrderStatus.COMPLETED];

    // Lấy khoảng thời gian từ 00:00 đến 23:59:59 hôm nay
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    // Lấy các đơn trong ngày
    const allOrders = await Order.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    const result = {
      fail: [] as Order[],
      completed: [] as Order[],
      processing: [] as Order[],
    };

    for (const order of allOrders) {
      if (failStatuses.includes(order.status)) {
        result.fail.push(order);
      } else if (completedStatuses.includes(order.status)) {
        result.completed.push(order);
      } else {
        result.processing.push(order);
      }
    }

    return result;
  }

  async getOrdersByGroup(
    year: number,
    month: number,
  ): Promise<{
    fail: number;
    completed: number;
    processing: number;
  }> {
    const qb = this.dataSource.createQueryBuilder(Order, 'order');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Group theo status
    const raw = await qb
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .andWhere(
        'order.createdAt >= :startDate AND order.createdAt < :endDate',
        { startDate, endDate },
      )
      .groupBy('order.status')
      .getRawMany();

    // Mapping lại kết quả
    const map = raw.reduce(
      (acc, row) => {
        acc[row.status] = Number(row.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Gom nhóm theo yêu cầu
    const fail = map[OrderStatus.CANCELLED] ?? 0;
    const completed =
      (map[OrderStatus.COMPLETED] ?? 0) + (map[OrderStatus.EXCHANGED] ?? 0);
    const total = raw.reduce((sum, row) => sum + Number(row.count), 0);
    const processing = total - fail - completed;

    return { fail, completed, processing };
    // return map[OrderStatus.DELIVERING];
  }

  async getRevenueByMonthV1(
    year: number,
    month: number,
  ): Promise<DailyRevenue[]> {
    // Xác định khoảng thời gian của tháng
    const startDate = startOfMonth(new Date(year, month - 1, 1));
    const endDate = endOfMonth(new Date(year, month - 1, 1));

    const query = this.dataSource
      .getRepository(Order)
      .createQueryBuilder('o')
      .select('DATE(o.createdAt)', 'date')
      .addSelect('SUM(o.total)', 'totalRevenue');

    if (year && month) {
      query.andWhere('o.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    query
      .andWhere('o.status = :status', { status: OrderStatus.COMPLETED })
      .groupBy('DATE(o.createdAt)')
      .orderBy('date', 'ASC');

    const rawResult = await query.getRawMany();
    this.logger.log(
      `Executing query to get revenue by month: ${query.getQueryAndParameters()}`,
    );

    return rawResult.map((item) => ({
      date: item.date,
      totalRevenue: parseFloat(item.totalRevenue),
    }));
  }

  async getTopSellingProducts(year: number, month: number) {
    const startDate = startOfMonth(new Date(year, month - 1, 1));
    const endDate = endOfMonth(new Date(year, month - 1, 1));

    const query = this.dataSource
      .getRepository(OrderItem)
      .createQueryBuilder('oi')
      .leftJoin('oi.order', 'o')

      .leftJoinAndSelect('oi.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(oi.quantity)', 'totalSold');
    if (year && month) {
      query.andWhere('o.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    query
      .andWhere('o.status = :status', { status: OrderStatus.COMPLETED })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .limit(10);

    // Logger.log(`${query.getQuery()}`, 'OrderService');
    const raw = await query.getRawMany();

    return raw.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      totalSold: Number(r.totalSold),
    }));
  }

  async getSalesStatisticsByCategory(year: number, month: number) {
    // Xác định khoảng thời gian của tháng
    const startDate = startOfMonth(new Date(year, month - 1, 1));
    const endDate = endOfMonth(new Date(year, month - 1, 1));

    const query = this.dataSource
      .getRepository(OrderItem)
      .createQueryBuilder('oi')
      .leftJoin('oi.order', 'o')
      .leftJoin('oi.product', 'product')
      .leftJoin('product.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('SUM(oi.quantity)', 'totalQuantitySold')
      .addSelect('SUM(oi.quantity * product.originalPrice)', 'totalRevenue');
    if (year && month) {
      query.andWhere('o.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    query
      .andWhere('o.status = :status', { status: OrderStatus.COMPLETED })
      .groupBy('category.id')
      .addGroupBy('category.name');
    // Logger.log(
    //   `Executing query to get sales statistics by category: ${query.getQuery()}`,
    //   'OrderService',
    // );

    const result = await query.getRawMany();

    return result;
  }
}
