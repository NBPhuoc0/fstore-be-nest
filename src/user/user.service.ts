import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateCartDto } from 'src/dto/update-cart.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { Cart, CartItem, User } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async getUserById(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['cart', 'cart.cartItems', 'cart.cartItems.product'],
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({ email });
  }

  async createUser(id: string, user: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(user);
    newUser.cart = this.cartRepository.create();
    newUser.cart.cartItems = [];
    newUser.id = id;

    return await this.userRepository.save(newUser);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async updateUser(id: string, updateData: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.getUserById(id);
  }

  async getCart(userId: string): Promise<Cart> {
    const user = await this.getUserById(userId);
    return user.cart;
  }

  async updateCart(userId: string, item: UpdateCartDto) {
    const user = await this.getUserById(userId);
    const cart = user.cart;

    const cartItem = await this.cartItemRepository.findOne({
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
      return await this.cartItemRepository
        .createQueryBuilder()
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
