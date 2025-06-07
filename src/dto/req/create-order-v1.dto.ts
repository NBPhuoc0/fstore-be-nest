import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { OrderPaymentMethod } from 'src/common/enums';

export class CreateOrderDtov1 {
  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  paymentMethod: OrderPaymentMethod;

  @ApiProperty({
    required: false,
  })
  voucherId?: number;

  userId: number;
}
