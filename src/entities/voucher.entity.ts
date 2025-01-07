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
  type: string;

  @Column({ nullable: false, type: 'float' })
  value: number;

  @Column({ nullable: false, type: 'float' })
  maxDiscount: number;

  @Column({ nullable: false })
  image: string;

  @Column({ nullable: false, type: 'timestamp' })
  startDate: Date;

  @Column({ nullable: false, type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: false })
  usedQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
