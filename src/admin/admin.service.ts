import { Injectable, Logger } from '@nestjs/common';
import { Inventory, ProductVariant } from 'src/entities';
import { DataSource } from 'typeorm';
import { randomInt } from 'crypto';
import { CartItemDto, CartItemDtoMock } from 'src/dto/req/cart-item.dto';
import { CreateOrderDtov1 } from 'src/dto/req/create-order-v1.dto';
import { OrderPaymentMethod } from 'src/common/enums';

@Injectable()
export class AdminService {
  private startDate;
  private endDate;
  constructor(readonly dataSource: DataSource) {
    this.startDate = new Date('2025-04-01');
    this.endDate = new Date('2025-06-19');
  }

  // async syncExistingVariantsWithoutInventory(): Promise<void> {
  //   const variants = await this.dataSource.getRepository(ProductVariant).find({
  //     where: { inventoryId: null },
  //   });

  //   for (const variant of variants) {
  //     const inventory = await this.dataSource.getRepository(Inventory).save({
  //       variantId: variant.id,
  //       productId: variant.productId,
  //       stockQuantity: 10,
  //     });

  //     // variant.inventoryId = inventory.id;
  //     const res = await this.dataSource
  //       .getRepository(ProductVariant)
  //       .save(variant);
  //     Logger.log(res, 'admin service: ');
  //   }
  // }

  // async syncInventoryForAllVariants(): Promise<void> {
  //   const variants = await this.dataSource
  //     .getRepository(ProductVariant)
  //     .find({});
  //   for (const variant of variants) {
  //     // variant.instock = false; // Default to false
  //     await this.dataSource.getRepository(ProductVariant).save(variant);
  //   }
  // }

  // Input mock CSV data

  getRandomDate(start: Date, end: Date): Date {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async generateMockOrders(count: number = 5): Promise<CreateOrderDtov1[]> {
    const orders: CreateOrderDtov1[] = [];

    const data = await this.dataSource.getRepository(Inventory).find({});

    for (let i = 0; i < count; i++) {
      const remainingInventory = new Map<number, number>();
      data.forEach((item) => {
        remainingInventory.set(item.variantId, item.quantity);
      });

      const selectedVariants = [...remainingInventory.keys()];
      const numCartItems = this.getRandomInt(
        1,
        Math.min(5, selectedVariants.length),
      );
      const pickedVariants = selectedVariants
        .sort(() => 0.5 - Math.random())
        .slice(0, numCartItems);

      const cart: CartItemDtoMock[] = [];

      for (const variantId of pickedVariants) {
        const availableQty = remainingInventory.get(variantId)!;
        if (availableQty <= 0) continue;

        const qty = this.getRandomInt(1, Math.min(5, availableQty));
        cart.push({
          variantId,
          quantity: qty,
        });
        remainingInventory.set(variantId, availableQty - qty);
      }

      const order: CreateOrderDtov1 = {
        name: `Mock User ${this.getRandomInt(1000, 9999)}`,
        address: '123 Mocking St',
        phone: `09${this.getRandomInt(10000000, 99999999)}`,
        email: `user${this.getRandomInt(1, 999)}@example.com`,
        paymentMethod:
          Math.random() < 0.488
            ? OrderPaymentMethod.COD
            : OrderPaymentMethod.BANKING,
        cart,
        createdAt: this.getRandomDate(this.startDate, this.endDate),
      };

      orders.push(order);
    }

    return orders;
  }
}
