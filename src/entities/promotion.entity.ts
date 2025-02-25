import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { PromotionType } from 'src/common/enums';

@Entity('promotions')
@Index('idx_promotions_code', ['urlHandle'], { unique: true })
export class Promotion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  urlHandle: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false, default: false })
  status: boolean;

  @Column({ nullable: false })
  type: PromotionType;

  @Column({ nullable: false, type: 'float' })
  value: number;

  @Column({ nullable: true, type: 'float', name: 'max_discount' })
  maxDiscount: number;

  @Column({ nullable: false })
  image: string;

  @Column({ nullable: false, type: 'timestamp', name: 'start_date' })
  startDate: Date;

  @Column({ nullable: false, type: 'timestamp', name: 'end_date' })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.promotion, {
    orphanedRowAction: 'nullify',
  })
  products: Product[];
}
