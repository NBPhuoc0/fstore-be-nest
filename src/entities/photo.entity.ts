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

  @ManyToOne(() => Product, (product) => product.photos, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Color, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'color_id' })
  color: Color;
}
