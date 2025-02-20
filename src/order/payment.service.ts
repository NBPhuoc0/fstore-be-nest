import { Injectable } from '@nestjs/common';
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

@Injectable()
export class PaymentService {
  //   constructor(private configService: ConfigService) {
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

  async createPayment(order: Order): Promise<CheckoutResponseDataType> {
    const body: CheckoutRequestType = {
      orderCode: order.id,
      // amount: order.totalPrice,
      amount: 1000, //! test
      description: 'Thanh toan don hang ' + order.id,
      items: order.orderItems.map((orderDetail) => ({
        name: orderDetail.product.name + ' ' + orderDetail.variant.color,
        quantity: orderDetail.quantity,
        price:
          orderDetail.product.salePrice || orderDetail.product.originalPrice,
      })),
      buyerName: order.user.fullName,
      buyerEmail: order.user.email,
      returnUrl: `https://github.com`,
      cancelUrl: `https://github.com`,
    };
    return this.payos.createPaymentLink(body);
  }

  async getPaymentLink(id: string): Promise<PaymentLinkDataType> {
    return this.payos.getPaymentLinkInformation(id);
  }

  async verifyPayOSPayment(query: any): Promise<WebhookDataType> {
    return this.payos.verifyPaymentWebhookData(query);
  }

  async cancelPayOSPayment(
    id: string,
    reason?: string,
  ): Promise<PaymentLinkDataType> {
    return this.payos.cancelPaymentLink(id, reason ?? 'thích ');
  }
}
