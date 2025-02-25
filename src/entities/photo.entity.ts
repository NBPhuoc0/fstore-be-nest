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

@Entity('photos')
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: false })
  position: number;

  @ManyToOne(() => Product, (product) => product.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: true, name: 'product_id' })
  productId: number;

  @ManyToOne(() => Color, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'color_id' })
  color: Color;

  @Column({ nullable: true, name: 'color_id' })
  colorId: number;
}
