import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class createCateDto {
  @ApiProperty({
    example: 'Category name',
    description: 'The name of the category',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'The id of the parent category',
    required: false,
  })
  @IsOptional()
  parent?: number;
}
