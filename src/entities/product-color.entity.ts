import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Product } from './product.entity';
import { Color } from './color.entity';

@Entity('product_colors')
export class ProductColor extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: false })
  position: number;

  @ManyToOne(() => Product, (product) => product.colors, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Color, { nullable: false })
  @JoinColumn({ name: 'color_id' })
  color: Color;
}
