import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { orderDeliveredTemplate } from './common/email-template/order-delivered';
import { orderSubmitTemplate } from './common/email-template/order-submit';

@Injectable()
export default class AppService {
  private readonly logger = new Logger('AppService');
  constructor(
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
