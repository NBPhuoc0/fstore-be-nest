import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './common/services/cache.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export default class AppService {
  private readonly logger = new Logger('AppService');
  constructor(private readonly cacheService: CacheService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleDailyUpdateProductsView() {
    this.logger.log('Daily update products view');
    // logic here
  }
}
