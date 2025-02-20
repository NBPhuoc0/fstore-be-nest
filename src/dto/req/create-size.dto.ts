import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class createSizeDto {
  @ApiProperty({
    example: 'Size name',
    description: 'The name of the size',
  })
  @IsNotEmpty()
  name: string;
}
