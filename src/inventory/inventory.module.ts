// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { ImportBatch, Inventory } from 'src/entities';
import { InventoryTransaction } from 'src/entities/inventory-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, InventoryTransaction, ImportBatch]),
  ],
  providers: [InventoryService],
  controllers: [],
  exports: [InventoryService],
})
export class InventoryModule {}
