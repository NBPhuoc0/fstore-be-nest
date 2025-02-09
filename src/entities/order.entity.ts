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
  address: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false, enum: OrderPaymentMethod })
  paymentMethod: OrderPaymentMethod;

  @Column({ nullable: true })
  paymentRef: string;

  @Column({ nullable: false, type: 'float' })
  shippingFee: number;

  @Column({ nullable: false, type: 'float' })
  subTotal: number;

  @Column({ nullable: false, type: 'float' })
  discount: number;

  @Column({ nullable: false, type: 'float' })
  total: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Voucher, { nullable: true })
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @Column()
  voucherId: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];
}
