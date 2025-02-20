import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get('test')
  async createOrder() {
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
