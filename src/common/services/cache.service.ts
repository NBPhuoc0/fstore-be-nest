import KeyvRedis, { Keyv } from '@keyv/redis';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';

@Injectable()
export class CacheService {
  private keyVCache: Keyv;
  private cache: Cacheable;
  private logger = new Logger('CacheService');

  constructor(private readonly configService: ConfigService) {
    this.logger.log('CacheService initialized');
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined');
    }
    const primary = new KeyvRedis(redisUrl);
    // this.cache = new Cacheable({ primary, ttl: '1d' });
    this.keyVCache = new Keyv({
      store: primary,
      useKeyPrefix: false,
    });
  }

  async get(key: string, namespace: string = null): Promise<any> {
    this.keyVCache.namespace = namespace;
    this.logger.log('in namespace: ' + this.keyVCache.namespace);

    return await this.keyVCache.get(key);
  }

  async iterator(namespace: string): Promise<any> {
    const res = [];
    this.keyVCache.namespace = namespace;
    for await (const [key, value] of this.keyVCache.iterator({})) {
      res.push({ key, value });
    }
    return res;
  }

  async set<T>(
    key: string,
    value: T,
    namespace: string = null,
    ttl?: number,
  ): Promise<void> {
    this.keyVCache.namespace = namespace;
    this.logger.log('in namespace: ' + this.keyVCache.namespace);
    await this.keyVCache.set<T>(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.keyVCache.delete(key);
  }

  // async increment(namespace: string, : number): Promise<number> { }
}
