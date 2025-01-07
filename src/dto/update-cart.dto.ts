import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDto {
  @ApiProperty()
  variantId: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  quantity: number;
}
