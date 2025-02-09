import { ApiProperty } from '@nestjs/swagger';
import { OrderPaymentMethod } from 'src/common/enums';

export class CreateOrderDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  paymentMethod: OrderPaymentMethod;

  @ApiProperty({
    required: false,
  })
  voucherId?: number;

  userId: number;
}
