import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketStatus, TicketType } from 'src/common/enums';
import { CreateTicketDto } from 'src/dto/req/create-ticket.dto';
import { Order } from 'src/entities';
import { Ticket } from 'src/entities/ticket.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async createTicket(dto: CreateTicketDto): Promise<Ticket> {
    // const order = await this.orderRepository.findOneBy({ id: dto.orderId });
    if (dto.type == TicketType.RETURNED) {
      //todo
    }

    // if (!order) {
    //   throw new NotFoundException('Order not found');
    // }

    const ticket = this.ticketRepository.create({
      email: dto.email,
      orderId: dto.orderId,
      type: dto.type,
      customerNote: dto.customerNote,
    });

    return this.ticketRepository.save(ticket);
  }

  async updateTicketStatus(
    ticketId: number,
    status: TicketStatus,
    adminNote?: string,
  ) {
    const ticket = await this.ticketRepository.findOneBy({ id: ticketId });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.status = status;
    if (adminNote) {
      ticket.adminNote = adminNote;
    }

    return this.ticketRepository.save(ticket);
  }

  async getAllTickets() {
    return this.ticketRepository.find({
      // relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTicketById(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOneBy({ id: id });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async removeTicket(id: number): Promise<void> {
    const ticket = await this.ticketRepository.findOneBy({ id: id });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === TicketStatus.PENDING) {
      throw new BadRequestException('Cannot delete a pending ticket');
    }

    await this.ticketRepository.remove(ticket);
  }
}
