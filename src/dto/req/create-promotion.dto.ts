import { ApiProperty } from '@nestjs/swagger';
import { PromotionType } from 'src/common/enums';

export class CreatePromotionDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: PromotionType;

  @ApiProperty()
  value: number;

  @ApiProperty({
    required: false,
  })
  maxDiscount?: number;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;
}
