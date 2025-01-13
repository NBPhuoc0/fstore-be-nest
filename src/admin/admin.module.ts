import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ProductModule } from 'src/product/product.module';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { PromotionModule } from 'src/promotion/promotion.module';

@Module({
  imports: [
    ProductModule,
    OrderModule,
    UserModule,
    PromotionModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
