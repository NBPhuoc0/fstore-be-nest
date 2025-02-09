import { ApiProperty } from '@nestjs/swagger';

export class createColorDto {
  @ApiProperty({
    example: 'Color name',
    description: 'The name of the color',
  })
  name: string;
}
