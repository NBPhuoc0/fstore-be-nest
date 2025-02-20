import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/req/create-user.dto';
import { UpdateCartDto } from 'src/dto/req/update-cart.dto';
import { UpdateUserDto } from 'src/dto/req/update-user.dto';
import { Cart, CartItem, User } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  constructor() {}

  async getUserById(id: string): Promise<User> {
    return User.findOne({
      where: { id },
      relations: ['cart', 'cart.cartItems', 'cart.cartItems.product'],
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    return User.findOneBy({ email });
  }

  async createUser(id: string, user: CreateUserDto): Promise<User> {
    const newUser = User.create(user);
    newUser.cart = Cart.create();
    newUser.cart.cartItems = [];
    newUser.id = id;

    return await newUser.save();
  }

  async getAllUsers(): Promise<User[]> {
    return await User.find();
  }

  async updateUser(id: string, updateData: UpdateUserDto): Promise<User> {
    await User.update(id, updateData);
    return this.getUserById(id);
  }

  async getCart(userId: string): Promise<Cart> {
    const user = await this.getUserById(userId);
    return user.cart;
  }

  async updateCart(userId: string, item: UpdateCartDto) {
    const user = await this.getUserById(userId);
    const cart = user.cart;

    const cartItem = await CartItem.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: item.productId },
        variant: { id: item.variantId },
      },
    });

    if (cartItem) {
      cartItem.quantity += item.quantity;
      return await cartItem.save();
    } else {
      return await CartItem.createQueryBuilder()
        .insert()
        .values({
          cart: { id: cart.id },
          product: { id: item.productId },
          variant: { id: item.variantId },
          quantity: item.quantity,
        })
        .execute();
    }
  }
}
