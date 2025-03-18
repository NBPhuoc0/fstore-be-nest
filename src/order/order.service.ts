import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus, VoucherType } from 'src/common/enums';
import { CreateOrderDto } from 'src/dto/req/create-order.dto';
import {
  Cart,
  CartItem,
  Order,
  OrderItem,
  Product,
  Voucher,
} from 'src/entities';
import { ProductService } from 'src/product/services/product.service';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(private dataSource: DataSource) {}

  //
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = new Order();

    let subTotal = 0;
    let discount = 0;
    let voucher: Voucher;

    order.address = dto.address;
    order.phone = dto.phone;
    order.paymentMethod = dto.paymentMethod;
    order.userId = dto.userId;

    // If payment method is BANKING, set order status to PENDING
    if (dto.paymentMethod === 'BANKING') {
      order.status = OrderStatus.PENDING;
    }

    const cart = await Cart.findOne({
      where: { userId: dto.userId },
      relations: ['cartItems'],
    });

    const orderItems = cart.cartItems.map((cartItem) => {
      const orderItem = new OrderItem();

      orderItem.productId = cartItem.productId;
      orderItem.variantId = cartItem.variantId;
      orderItem.quantity = cartItem.quantity;

      if (cartItem.product.salePrice) {
        discount +=
          (cartItem.product.originalPrice - cartItem.product.salePrice) *
          cartItem.quantity;
      }
      subTotal += cartItem.product.originalPrice * cartItem.quantity;

      return orderItem;
    });

    order.orderItems = orderItems;

    // Apply voucher
    if (dto.voucherId) {
      voucher = await Voucher.findOneBy({
        id: dto.voucherId,
      });

      if (!voucher) {
        throw new BadRequestException('Voucher not found');
      }

      if (voucher.startDate > new Date()) {
        throw new BadRequestException('Voucher is not available yet');
      }

      if (
        voucher.endDate < new Date() ||
        voucher.quantity <= voucher.usedQuantity
      ) {
        throw new BadRequestException('Voucher is expired');
      }

      order.voucher = voucher;

      if ((voucher.type = VoucherType.PERCENT)) {
        let voucherDiscount = (subTotal * voucher.value) / 100;

        if (voucher.maxDiscount && voucherDiscount > voucher.maxDiscount) {
          voucherDiscount = voucher.maxDiscount;
        }
        discount += voucherDiscount;
      } else {
        discount + voucher.value;
      }
    }

    //todo: calculate shipping fee
    order.shippingFee = 15000;

    order.subTotal = subTotal;
    order.discount = discount;
    order.total = subTotal - discount + order.shippingFee;

    // Save order and update voucher used quantity
    return this.dataSource.transaction(async (manager) => {
      await manager.increment(Voucher, { id: voucher.id }, 'usedQuantity', 1);
      await manager.delete(Cart, { id: cart.id });
      for (const prod of orderItems) {
        await manager.increment(
          Product,
          { id: prod.productId },
          'sale_count',
          prod.quantity,
        );
      }
      return await manager.save(order);
    });
  }

  async updateOrderStatus(id: number, status: OrderStatus) {
    await Order.update({ id }, { status });
  }

  async getOrderById(id: number): Promise<Order> {
    return Order.findOne({
      where: { id },
      relations: ['orderItems'],
    });
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Order.find({
      where: { userId },
      relations: ['orderItems'],
    });
  }

  async getOrders(): Promise<Order[]> {
    return Order.find({
      relations: ['orderItems'],
    });
  }

  async deleteOrder(id: number) {
    await Order.delete({ id });
  }
}
