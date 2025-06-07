import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class sendChatDto {
  @ApiProperty({
    example: '',
    description: 'The question to ask the AI chatbot',
  })
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: '123',
    description: 'The ID of the user asking the question',
  })
  @IsNotEmpty()
  id: string;
}
