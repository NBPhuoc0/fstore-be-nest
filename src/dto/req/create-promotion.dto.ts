import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PromotionType } from 'src/common/enums';

export class CreatePromotionDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  type: PromotionType;

  @ApiProperty()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    required: false,
  })
  maxDiscount?: number;

  @ApiProperty()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  endDate: Date;
}
