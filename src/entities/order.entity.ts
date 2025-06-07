import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Voucher } from './voucher.entity';
import { OrderItem } from './order-item.entity';
import { OrderPaymentMethod, OrderStatus } from 'src/common/enums';

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    enum: OrderStatus,
    default: OrderStatus.PROCESSING,
  })
  status: OrderStatus;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false, enum: OrderPaymentMethod, name: 'payment_method' })
  paymentMethod: OrderPaymentMethod;

  @Column({ nullable: true, name: 'payment_ref' })
  paymentRef: string;

  @Column({ nullable: false, type: 'float', name: 'shipping_fee' })
  shippingFee: number;

  @Column({ nullable: false, type: 'float', name: 'sub_total' })
  subTotal: number;

  @Column({ nullable: false, type: 'float' })
  discount: number;

  @Column({ nullable: false, type: 'float' })
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;

  // @ManyToOne(() => User, { nullable: false })
  // @JoinColumn({ name: 'user_id' })
  // user: User;

  // @Column({ nullable: false, name: 'user_id' })
  // userId: number;

  @ManyToOne(() => Voucher, { nullable: true })
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @Column({ nullable: true, name: 'voucher_id' })
  voucherId: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: OrderItem[];
}
