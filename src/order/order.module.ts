import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem, Voucher } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Voucher])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
