import { ApiProperty } from '@nestjs/swagger';

export class createSizeDto {
  @ApiProperty({
    example: 'Size name',
    description: 'The name of the size',
  })
  name: string;
}
