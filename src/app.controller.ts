import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
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
import { Order, Product } from './entities';
import { TicketService } from './order/services/ticket.service';
import { CreateTicketDto } from './dto/req/create-ticket.dto';
import { PromotionService } from './promotion/promotion.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatService: ChatService,
    private readonly productService: ProductService,
    private readonly ticketService: TicketService,
    private readonly promotionService: PromotionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  @Redirect('/api/docs', 302)
  index(@Res() res) {
    // res.status(302).redirect('/api/docs');
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

  @Get('voucher')
  async getVoucher() {
    return this.promotionService.getVouchers();
  }

  @Get('ticket/:id')
  async getTicketById(@Param('id') id: number) {
    // Logger.log(`Fetching ticket with ID: ${id}`, 'AppController');
    return await this.ticketService.getTicketById(+id);
  }

  @Post('ticket')
  async createTicket(@Body() dto: CreateTicketDto) {
    // return dto;
    const ticket = await this.ticketService.createTicket(dto);
    this.eventEmitter.emit('ticket.created', ticket);
    return ticket;
  }
}
