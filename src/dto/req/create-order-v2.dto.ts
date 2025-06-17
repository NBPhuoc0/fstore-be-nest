import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { OrderPaymentMethod } from 'src/common/enums';
import { CartItemDto } from './cart-item.dto';
import { Type } from 'class-transformer';

export class CreateOrderDtov2 {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(OrderPaymentMethod)
  paymentMethod: OrderPaymentMethod;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  voucherId?: number;

  userId: number;

  @ApiProperty({
    type: [CartItemDto],
    description: 'List of cart items to be included in the order',
    isArray: true,
  })
  // @Type(() => CartItemDto)
  @IsNotEmpty()
  cart: CartItemDto[];

  @ApiProperty({
    required: false,
    description: 'Optional note for the order',
  })
  @IsNotEmpty()
  returnUrl: string;

  @ApiProperty({
    required: false,
    description: 'district ID of the shipping origin',
  })
  @IsNotEmpty()
  to_district_id: number;

  @ApiProperty({
    required: false,
    description: 'ward code of the shipping origin',
  })
  @IsNotEmpty()
  to_ward_code: string;
}
