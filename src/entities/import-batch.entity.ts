import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('import_batches')
export class ImportBatch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, name: 'supplier_name' })
  supplierName: string;

  // @Column({ nullable: true })
  // referenceCode: string;

  @Column({ nullable: true })
  note: string;

  @Column({ name: 'total_cost', type: 'decimal', nullable: true })
  totalCost: number;

  @Column({ type: 'decimal', nullable: true, name: 'incidental_costs' })
  incidentalCosts: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;
}
