import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { VoucherType } from 'src/common/enums';

export class CreateVoucherDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  type: VoucherType;

  @ApiProperty()
  @IsNotEmpty()
  value: number;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  fromValue?: number;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  maxDiscount?: number;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;
}
