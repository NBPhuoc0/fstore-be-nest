import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './common/services/cache.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { orderSubmitTemplate } from './common/email-template/order-submit';
import { orderDeliveredTemplate } from './common/email-template/order-delivered';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export default class AppService {
  private readonly logger = new Logger('AppService');
  constructor(
    private readonly cacheService: CacheService,
    private readonly mailerService: MailerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleDailyUpdateProductsView() {
    this.logger.log('Daily update products view');
    // logic here
  }

  @OnEvent('order.submit', { async: true })
  async sendOrderSubmitMail(data: any) {
    return await this.mailerService.sendMail({
      to: data.email,
      subject: 'Đơn hàng đã được xác nhận',
      text: 'Order submitted',
      html: orderSubmitTemplate(data),
    });
  }

  @OnEvent('order.delivered', { async: true })
  async sendOrderDeliveredMail(data: any) {
    return await this.mailerService.sendMail({
      to: data.email,
      subject: 'Đơn hàng đã được gửi đi',
      text: 'Order delivered',
      html: orderDeliveredTemplate(data),
    });
  }
}
