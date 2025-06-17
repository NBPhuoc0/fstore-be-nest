import { Injectable, Logger } from '@nestjs/common';
import { Inventory, ProductVariant } from 'src/entities';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(readonly dataSource: DataSource) {}

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
}
