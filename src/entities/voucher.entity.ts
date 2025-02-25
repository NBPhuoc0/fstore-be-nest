import { VoucherType } from 'src/common/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';

@Entity('vouchers')
@Index('idx_vouchers_code', ['code'], { unique: true })
export class Voucher extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: false })
  type: VoucherType;

  @Column({ nullable: false, type: 'float' })
  value: number;

  @Column({ nullable: true, type: 'float', name: 'max_discount' })
  maxDiscount: number;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: false, type: 'timestamp', name: 'start_date' })
  startDate: Date;

  @Column({ nullable: false, type: 'timestamp', name: 'end_date' })
  endDate: Date;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: false, default: 0, name: 'used_quantity' })
  usedQuantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
