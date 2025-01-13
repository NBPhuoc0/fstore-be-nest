import KeyvRedis from '@keyv/redis';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';

@Injectable()
export class CacheService {
  private cache: Cacheable;
  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined');
    }
    const secondary = new KeyvRedis(redisUrl);
    this.cache = new Cacheable({ secondary, ttl: '30d' });
  }

  async get(key: string): Promise<any> {
    return await this.cache.get(key);
  }

  async set<T>(key: string, value: T, ttl?: number | string): Promise<void> {
    await this.cache.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }
}
