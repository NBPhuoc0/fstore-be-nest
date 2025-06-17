import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { TicketType } from 'src/common/enums';

export class CreateTicketDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsOptional()
  orderId?: number;

  @ApiProperty()
  @IsEnum(TicketType)
  type: TicketType;

  @ApiProperty()
  @IsOptional()
  customerNote?: string;
}
