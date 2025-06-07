import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import AppService from './app.service';
import { ChatService } from './chatbot/chat.service';
import { get } from 'http';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatService: ChatService,
  ) {}

  @Get()
  index(@Res() res) {
    res.status(302).redirect('/api/docs');
  }

  @Get('search')
  async searchProducts(@Query('query') query: string) {
    if (!query) {
      return { items: [], total: 0, page: 1, limit: 10 };
    }

    const suggestions = await this.chatService.suggestProducts(query);
    return suggestions;
  }

  @Get('mail')
  async sendMail() {
    return await this.appService.sendMail();
  }
}
