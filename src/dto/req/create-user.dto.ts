import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'phuoc@mail.com' })
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  address: string;

  phone: string;
  avatar: string;
  provider: string;
}
