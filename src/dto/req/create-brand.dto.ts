import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class createBrandDto {
  @ApiProperty({
    example: 'Nike',
    description: 'The name of the brand',
  })
  @IsNotEmpty()
  name: string;
}
