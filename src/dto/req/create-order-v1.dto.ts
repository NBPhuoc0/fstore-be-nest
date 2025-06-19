import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { OrderPaymentMethod } from 'src/common/enums';
import { CartItemDto, CartItemDtoMock } from './cart-item.dto';

export class CreateOrderDtov1 {
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
  paymentMethod: OrderPaymentMethod;

  @ApiProperty({
    required: false,
  })
  voucherId?: number;

  @ApiProperty({
    type: [CartItemDtoMock],
    description: 'List of cart items to be included in the order',
    isArray: true,
  })
  // @Type(() => CartItemDto)
  @IsNotEmpty()
  cart: CartItemDtoMock[];

  @IsNotEmpty()
  @ApiProperty({
    required: false,
  })
  createdAt?: Date;
}
