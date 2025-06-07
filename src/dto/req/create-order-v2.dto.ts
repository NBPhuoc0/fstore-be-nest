import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
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
}
