import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Promotion, Voucher } from 'src/entities';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [],
  controllers: [PromotionController],
  providers: [PromotionService],
})
export class PromotionModule {}
