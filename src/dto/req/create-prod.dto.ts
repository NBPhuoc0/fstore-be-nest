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
  category: number;

  @ApiProperty({
    example: 1,
    description: 'The brand id of the product',
  })
  brand: number;

  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'The list color of the product',
  })
  colors: number[];

  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'The list size of the product',
  })
  sizes: number[];
}
