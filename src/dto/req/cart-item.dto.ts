import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@ApiExtraModels()
export class CartItemDto {
  @ApiProperty()
  @IsNotEmpty()
  variantId: number;

  @ApiProperty()
  @IsNotEmpty()
  productId: number;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;
}
