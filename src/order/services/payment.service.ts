import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PayOS from '@payos/node';
const PayOs = require('@payos/node');
import {
  CheckoutRequestType,
  CheckoutResponseDataType,
  PaymentLinkDataType,
  WebhookDataType,
} from 'src/common/types';
import { Order } from 'src/entities/order.entity';
import { OrderService } from './order.service';

@Injectable()
export class PaymentService {
  constructor(private readonly orderService: OrderService) {}
  //     const payos = new PayOS(
  //       this.configService.get<string>('PAYOS_CLIENT_ID'),
  //       this.configService.get<string>('PAYOS_API_KEY'),
  //       this.configService.get<string>('PAYOS_CHECKSUM_KEY'),
  //     );
  //     this.payos = payos;
  //   }

  //   private payos: PayOS;
  private payos: PayOS = new PayOs(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY,
  );

  // private returnUrl = 'localhost:5173/submitorder';

  async createPayOSPaymentTest(): Promise<CheckoutResponseDataType> {
    const body = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: 2000,
      description: 'Thanh toan don hang',
      items: [
        {
          name: 'Mì tôm Hảo Hảo ly',
          quantity: 1,
          price: 10000,
        },
      ],
      returnUrl: `https://github.com`,
      cancelUrl: `https://github.com`,
    };

    return this.payos.createPaymentLink(body);
  }

  async createPayment(
    orderId: number,
    returnUrl: string,
  ): Promise<CheckoutResponseDataType> {
    const order = await this.orderService.getOrderById(orderId);
    // return order;
    const body: CheckoutRequestType = {
      orderCode: order.id,
      // amount: order.total,
      amount: 2000, //! test
      description: 'Thanh toan don hang ' + order.id,
      items: order.orderItems.map((orderDetail) => ({
        name: orderDetail.product.name + ' ' + orderDetail.variant.color.name,
        quantity: orderDetail.quantity,
        price:
          +orderDetail.product.salePrice || +orderDetail.product.originalPrice,
      })),
      buyerName: order.name,
      buyerEmail: order.email,
      buyerPhone: order.phone,
      buyerAddress: order.address,
      returnUrl: returnUrl,
      cancelUrl: returnUrl,
    };
    return this.payos.createPaymentLink(body);
  }

  async getPaymentLink(id: string): Promise<PaymentLinkDataType> {
    return this.payos.getPaymentLinkInformation(id);
  }

  // changeReturnUrl(url: string): void {
  //   // this.returnUrl = url;
  //   // Logger.log(`Return URL changed to: ${this.returnUrl}`, 'PaymentService');
  // }

  async confirmWebhook(url: string): Promise<string> {
    return await this.payos.confirmWebhook(url);
  }

  async verifyPayOSPayment(query: any): Promise<WebhookDataType> {
    const res = this.payos.verifyPaymentWebhookData(query);
    if (res) this.orderService.confirmOrderPay(res.orderCode);
    Logger.log(
      `Payment verification success: ${JSON.stringify(res.orderCode)}`,
      'PaymentService',
    );
    return res;
  }

  async cancelPayOSPayment(
    id: string,
    reason?: string,
  ): Promise<PaymentLinkDataType> {
    return this.payos.cancelPaymentLink(id, reason ?? 'thích ');
  }
}
