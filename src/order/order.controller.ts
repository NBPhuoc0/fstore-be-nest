import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { SupabaseAuthGuard } from 'src/auth/guards/supabase.auth.guard';
import { CreateOrderDtov2 } from 'src/dto/req/create-order-v2.dto';
import { OrderPaymentMethod } from 'src/common/enums';

@Controller('order')
// @UseGuards(SupabaseAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
  ) {}
  @Post('create')
  async createOrder(@Body() dto: CreateOrderDtov2) {
    const res = await this.orderService.createOrderv2(dto);
    if (dto.paymentMethod === OrderPaymentMethod.BANKING) {
      const payment = await this.paymentService.createPayment(res.id);
      return await this.orderService.paymentReference(res, payment.checkoutUrl);
    }
    return res;
  }

  @Post('payoshook')
  async handlePayOSWebhook(@Body() body: any) {
    return this.paymentService.verifyPayOSPayment(body);
  }

  @Get('confirmhook')
  async handleConfirmHook() {
    return await this.paymentService.confirmWebhook(
      'http://fstore-nbphuoc.ddns.net:8080/order/payoshook',
    );
  }

  @Get('returnurl/:url')
  async handleReturnUrl(@Param('url') url: string) {
    return this.paymentService.changeReturnUrl(url);
  }

  @Get('test')
  async createPaymentLinkTest() {
    return this.paymentService.createPayOSPaymentTest();
  }

  @Get('test/:id')
  async getPaymentLinktest(@Param('id') id: string) {
    return this.paymentService.getPaymentLink(id);
  }

  @Delete('test/:id')
  async deleteOrder(@Param('id') id: string) {
    return this.paymentService.cancelPayOSPayment(id);
  }
}
