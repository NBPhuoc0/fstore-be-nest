import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CartItemDto } from './cart-item.dto';

export class ReturnOrderDto {
  @ApiProperty({
    description: 'ID of the order to be returned',
  })
  @IsNumber()
  orderId: number;

  @IsOptional()
  @ApiProperty({
    description: 'Reason for returning the order',
    required: false,
  })
  reason?: string;

  @IsOptional()
  @ApiProperty({
    type: [CartItemDto],
    description: 'List of cart items to be included in the order',
    isArray: true,
  })
  items?: CartItemDto[];
}
