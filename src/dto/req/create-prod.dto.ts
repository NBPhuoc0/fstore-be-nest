import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateProdDto {
  @ApiProperty({
    example: 'Nike Air Max 90',
    description: 'The name of the product',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'This is a description',
    description: 'The description of the product',
  })
  @IsNotEmpty()
  metaDesc: string;

  @ApiProperty({
    example: 1,
    description: 'The original price of the product',
  })
  @IsNotEmpty()
  originalPrice: number;

  @ApiProperty({
    example: 1,
    description: 'The category id of the product',
  })
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({
    example: 1,
    description: 'The brand id of the product',
  })
  @IsNotEmpty()
  brandId: number;

  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'The list color of the product',
  })
  @IsNotEmpty()
  colorIds: number[];

  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'The list size of the product',
  })
  @IsNotEmpty()
  sizeIds: number[];
}
