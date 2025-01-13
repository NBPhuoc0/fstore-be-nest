import { Module } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { S3ClientService } from './services/s3-client.service';

@Module({
  imports: [],
  providers: [CacheService, S3ClientService],
  exports: [CacheService],
})
export class CommonModule {}
