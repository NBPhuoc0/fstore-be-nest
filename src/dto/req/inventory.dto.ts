import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class InventoryActionDto {
  variantId: number;
  productId: number;
  importBatchId?: number;
  orderId?: number;
  quantity: number;
  price?: number;
  note?: string;
  inventoryId?: number;
}

export class ImportBatchDto {
  @ApiProperty()
  @IsNotEmpty()
  supplierName?: string;

  @ApiProperty()
  note?: string;

  @ApiProperty()
  @IsNotEmpty()
  incidentalCosts?: number;

  @ApiProperty()
  @IsNotEmpty()
  createdBy?: string;

  items?: InventoryActionDto[];
}

export class InventoryBulkDto {
  data: InventoryActionDto[];
  note?: string;
}
