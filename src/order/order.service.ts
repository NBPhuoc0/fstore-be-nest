import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus, VoucherType } from 'src/common/enums';
import { CreateOrderDto } from 'src/dto/req/create-order.dto';
import { Cart, CartItem, Order, OrderItem, Voucher } from 'src/entities';
import { ProductService } from 'src/product/services/product.service';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    private dataSource: DataSource,
  ) {}

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

    const cart = await this.cartRepository.findOne({
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
      voucher = await this.voucherRepository.findOneBy({
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
      return await manager.save(order);
    });
  }

  async updateOrderStatus(id: number, status: OrderStatus) {
    await this.orderRepository.update({ id }, { status });
  }

  async getOrderById(id: number) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });
  }

  async getOrdersByUserId(userId: number) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['orderItems'],
    });
  }

  async getOrders() {
    return this.orderRepository.find({
      relations: ['orderItems'],
    });
  }

  async deleteOrder(id: number) {
    await this.orderRepository.delete({ id });
  }
}
