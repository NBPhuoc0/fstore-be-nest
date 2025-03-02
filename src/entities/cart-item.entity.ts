import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  BaseEntity,
} from 'typeorm';
import { Cart } from './cart.entity';
import { ProductVariant } from './product-variant.entity';
import { Product } from './product.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ nullable: false, name: 'cart_id' })
  cartId: number;

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
