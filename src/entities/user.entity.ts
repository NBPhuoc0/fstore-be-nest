import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Order } from './order.entity';

@Entity({ name: 'users' })
@Index('uq_users_email', ['email'], { unique: true }) // Unique index cho email
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    unique: true,
    nullable: true,
  })
  phone: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    nullable: true,
  })
  provider: string;

  @OneToOne(() => Cart, (cart) => cart.user, { cascade: true })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Column({ default: false, name: 'is_admin' })
  isAdmin: boolean;
}
