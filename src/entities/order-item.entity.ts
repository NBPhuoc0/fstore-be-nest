import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  BaseEntity,
} from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from './product-variant.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ nullable: true, name: 'order_id' })
  orderId: number;

  @ManyToOne(() => ProductVariant, { nullable: false })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ nullable: false, name: 'variant_id' })
  variantId: number;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: false, name: 'product_id' })
  productId: number;

  @Column({ nullable: false })
  quantity: number;
}
