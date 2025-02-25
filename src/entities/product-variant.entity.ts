import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Color } from './color.entity';
import { Size } from './size.entity';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: true, name: 'inventory_quantity' })
  inventoryQuantity: number;

  @Column({ default: true })
  instock: boolean;

  @Column({ nullable: true, name: 'color_id' })
  colorId: number;

  @ManyToOne(() => Color, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'color_id' })
  color: Color;

  @Column({ nullable: true, name: 'size_id' })
  sizeId: number;

  @ManyToOne(() => Size, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'size_id' })
  size: Size;

  @Column({ nullable: true, name: 'product_id' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
