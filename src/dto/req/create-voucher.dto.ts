import { ApiProperty } from '@nestjs/swagger';
import { VoucherType } from 'src/common/enums';

export class CreateVoucherDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: VoucherType;

  @ApiProperty()
  value: number;

  @ApiProperty({
    required: false,
  })
  maxDiscount?: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;
}
