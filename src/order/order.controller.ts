import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from 'src/auth/guards/supabase.auth.guard';
import { CreateOrderDtov2 } from 'src/dto/req/create-order-v2.dto';
import { OrderPaymentMethod } from 'src/common/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebhookType } from 'src/common/types';
import { OrderService } from './services/order.service';
import { PaymentService } from './services/payment.service';
import { ShippingService } from './services/shipping.service';
import { CreateShippingOrderDto } from 'src/dto/req/create-shipping-order.dto';

@Controller('order')
// @UseGuards(SupabaseAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly shippingService: ShippingService,
    private eventEmitter: EventEmitter2,
  ) {}
  logger = new Logger(OrderController.name);

  @Post('create')
  async createOrder(@Body() dto: CreateOrderDtov2) {
    let res = await this.orderService.createOrderv2(dto);

    if (!res) {
      throw new Error('Failed to create order');
    }
    if (dto.paymentMethod === OrderPaymentMethod.BANKING) {
      const payment = await this.paymentService.createPayment(
        res.id,
        dto.returnUrl,
      );
      res = await this.orderService.updatePaymentReference(
        res,
        payment.checkoutUrl,
      );
    }
    try {
      // create shipping order
      const shippingDto: CreateShippingOrderDto = new CreateShippingOrderDto();

      shippingDto.to_address = dto.address;
      shippingDto.to_district_id = dto.to_district_id;
      shippingDto.to_ward_code = dto.to_ward_code;
      shippingDto.to_phone = dto.phone;
      shippingDto.to_name = dto.name;

      shippingDto.from_address = '1 Võ Văn Ngân';
      shippingDto.from_district_id = 3695;
      shippingDto.from_ward_code = '90742';
      shippingDto.from_phone = '0333495017';
      shippingDto.from_name = '0333495017';

      shippingDto.items = res.orderItems.map((item) => ({
        id: item.id,
        name: item.product.name,
        code: item.id + '',
        quantity: item.quantity,
        price: +item.product.originalPrice,
        weight: 10,
        length: 10,
        width: 10,
        height: 10,
      }));
      if (dto.paymentMethod === OrderPaymentMethod.COD) {
        shippingDto.cod_amount = res.total;
      }

      shippingDto.insurance_value = res.total;
      // if (res.total > 500000) {
      //   shippingDto.payment_type_id = 1; // free ship > 500k
      // } else {
      // }
      if (dto.paymentMethod === OrderPaymentMethod.BANKING) {
        shippingDto.payment_type_id = 1;
      } else {
        shippingDto.payment_type_id = 2;
      }
      shippingDto.weight = 1000 * res.orderItems.length; // 1000 gram x sl
      shippingDto.length = 10 * res.orderItems.length; // 10 cm x sl
      shippingDto.width = 10 * res.orderItems.length; // 10 cm x sl
      shippingDto.height = 10 * res.orderItems.length; // 10 cm x sl
      shippingDto.service_type_id = 2;
      shippingDto.pick_shift = [2];
      shippingDto.required_note = 'CHOXEMHANGKHONGTHU'; //
      // Logger.log(
      //   `Creating shipping order with dto: ${JSON.stringify(shippingDto)}`,
      //   'OrderController',
      // );
      // create shipping order
      const shippingOrderdata =
        await this.shippingService.createOrder(shippingDto);
      // Logger.log(
      //   `Shipping order created with code: ${shippingOrderdata.data}`,
      //   'OrderController',
      // );
      // update order with shipping order code
      res = await this.orderService.updateShippingOrderCode(
        res,
        shippingOrderdata,
      );
      this.eventEmitter.emit('order.submit', res);
      return res;
    } catch (error) {
      await this.orderService.deleteOrder(res);
    }

    // send mail for order created
  }

  @Post('payoshook')
  async handlePayOSWebhook(@Body() body: WebhookType) {
    Logger.log(
      `Received PayOS webhook: ${JSON.stringify(body)}`,
      'OrderController',
    );
    return this.paymentService.verifyPayOSPayment(body);
  }

  @Get('confirmhook')
  async handleConfirmHook() {
    return await this.paymentService.confirmWebhook(
      'https://api.nbphuoc.xyz/order/payoshook',
    );
  }
}
