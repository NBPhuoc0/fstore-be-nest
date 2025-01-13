import { ApiProperty } from '@nestjs/swagger';

export class CreateProdDto {
  @ApiProperty({
    example: 'Nike Air Max 90',
    description: 'The name of the product',
  })
  name: string;

  @ApiProperty({
    example: 'This is a description',
    description: 'The description of the product',
  })
  metaDesc: string;

  @ApiProperty({
    example: 1,
    description: 'The original price of the product',
  })
  originalPrice: number;

  @ApiProperty({
    example: 1,
    description: 'The category id of the product',
  })
  categoryId: number;

  @ApiProperty({
    example: 1,
    description: 'The brand id of the product',
  })
  brandId: number;

  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'The list color of the product',
  })
  colorIds: number[];

  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'The list size of the product',
  })
  sizeIds: number[];

}
