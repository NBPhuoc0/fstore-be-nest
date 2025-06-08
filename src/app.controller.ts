import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import AppService from './app.service';
import { ChatService } from './chatbot/chat.service';
import { get } from 'http';
import { ProductService } from './product/services/product.service';
import { PaginatedResponse } from './dto/res/paginated-response.dto';
import { Product } from './entities';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatService: ChatService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  index(@Res() res) {
    res.status(302).redirect('/api/docs');
  }

  @Get('search')
  async searchProducts(
    @Query('query') query: string,
  ): Promise<PaginatedResponse<Product>> {
    let res = {
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    if (!query) {
      return res;
    }
    const suggestions = await this.chatService.suggestProducts(query);
    const products = suggestions.map(
      async (suggestion) =>
        await this.productService.getProductById(suggestion.id),
    );
    res.data = await Promise.all(products);
    Logger.log(
      `Search query: ${query}, found ${suggestions.length} products`,
      'AppController',
    );
    return res;
  }

  @Get('mail')
  async sendMail() {
    return await this.appService.sendMail();
  }
}
