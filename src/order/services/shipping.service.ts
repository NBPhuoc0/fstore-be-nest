// src/shipping/shipping.service.ts

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CreateShippingOrderDto } from 'src/dto/req/create-shipping-order.dto';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  private readonly baseUrl = process.env.GHN_BASE_URL;

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Token: '3ba50132-46c7-11f0-9b81-222185cb68c8',
      ShopId: '196838',
    };
  }

  async createOrder(dto: CreateShippingOrderDto): Promise<any> {
    const url = `https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      return data;
    } catch (error) {
      this.logger.debug(error);
      return error;
    }
  }

  async getOrderInfo(orderCode: string): Promise<any> {
    const url = `${this.baseUrl}/shipping-order/detail`;
    const response = await axios.post(
      url,
      { order_code: orderCode },
      { headers: this.headers },
    );

    if (response.data.code !== 200) {
      throw new Error('GHN API get order failed');
    }

    return response.data.data;
  }
}
