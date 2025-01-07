import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem, User } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, CartItem, Cart])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
