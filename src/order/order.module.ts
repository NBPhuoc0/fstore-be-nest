import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './order.controller';
import { PaymentService } from './services/payment.service';
import { ShippingService } from './services/shipping.service';
import { TicketService } from './services/ticket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { Order } from 'src/entities';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Order]), InventoryModule],
  controllers: [OrderController],
  providers: [OrderService, PaymentService, ShippingService, TicketService],
  exports: [OrderService, PaymentService, ShippingService, TicketService],
})
export class OrderModule {}
