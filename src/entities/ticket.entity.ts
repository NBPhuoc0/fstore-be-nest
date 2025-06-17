import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Order } from './order.entity';
import { TicketStatus, TicketType } from 'src/common/enums';

@Entity('tickets')
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'email' })
  email: string;

  // @ManyToOne(() => Order)
  // @JoinColumn({ name: 'order_id' })
  // order: Order;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @Column({ type: 'enum', enum: TicketType, default: TicketType.OTHERS })
  type: TicketType;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.PENDING })
  status: TicketStatus;

  @Column({ type: 'text', nullable: true })
  customerNote: string;

  @Column({ type: 'text', nullable: true })
  adminNote: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
