import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class createColorDto {
  @ApiProperty({
    example: 'Color name',
    description: 'The name of the color',
  })
  @IsNotEmpty()
  name: string;
}
