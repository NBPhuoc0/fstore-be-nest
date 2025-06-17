import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

export enum InventoryTransactionType {
  IMPORT = 'IMPORT', // Nhập hàng
  EXPORT = 'EXPORT', // Xuất hàng
  RETURN = 'RETURN', // Trả hàng
  ADJUST = 'ADJUST', // Điều chỉnh tồn kho
}

@Entity('inventory_transactions')
export class InventoryTransaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'variant_id' })
  variantId: number;

  @Column({ name: 'import_batch_id', nullable: true })
  importBatchId: number;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @Column({ type: 'enum', enum: InventoryTransactionType })
  transactionType: InventoryTransactionType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', nullable: true })
  price: number;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
