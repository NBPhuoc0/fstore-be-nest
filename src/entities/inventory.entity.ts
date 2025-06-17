// src/inventory/entities/inventory.entity.ts
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

@Entity('inventories')
export class Inventory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({ name: 'variant_id' })
  variantId: number;

  @Column({ name: 'import_batch_id' })
  importBatchId: number;

  @Column({
    type: 'int',
    name: 'remain_quantity',
  })
  remainingQuantity: number;

  @Column({})
  quantity: number;

  @Column({ type: 'decimal' })
  price: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
