import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { sendChatDto } from 'src/dto/req/send-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('loaddata')
  async loadDataToVectorStore() {
    return this.chatService.importDatatoVectorStore();
  }

  @Post('ask')
  async askQuestion(@Body() dto: sendChatDto) {
    return this.chatService.sendMessage(dto.id, dto.message);
  }
}
