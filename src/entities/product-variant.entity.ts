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

  @Column({ nullable: true })
  inventoryQuantity: number;

  @Column({ default: true })
  instock: boolean;

  @Column({ nullable: true })
  colorId: number;

  @ManyToOne(() => Color, { createForeignKeyConstraints: false })
  @JoinColumn({})
  color: Color;

  @Column({ nullable: true })
  sizeId: number;

  @ManyToOne(() => Size, { createForeignKeyConstraints: false })
  @JoinColumn({})
  size: Size;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
