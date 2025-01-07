import { ApiProperty } from '@nestjs/swagger';

export class createBrandDto {
  @ApiProperty({
    example: 'Nike',
    description: 'The name of the brand',
  })
  name: string;
}
