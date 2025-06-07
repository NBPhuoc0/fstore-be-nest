import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './common/services/cache.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';

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

  async sendMail() {
    return await this.mailerService.sendMail({
      to: 'phcnguyenba@gmail.com',
      subject: 'OTP verification',
      text: 'OTP verification',
      html: 'OtpTemplate(usename, otp.otp, type)',
    });
  }
}
