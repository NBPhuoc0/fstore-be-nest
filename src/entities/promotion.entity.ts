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

  @Column({ nullable: false })
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.promotion)
  products: Product[];
}
