import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { SignInDto } from 'src/dto/sign-in.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private supabaseClient: SupabaseClient;

  constructor(private readonly userService: UserService) {
    this.supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  async signInUser(dto: SignInDto): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    return {
      data: data.session,
      error: error,
    };
  }

  async signInGG() {
    const { data, error } = await this.supabaseClient.auth.signInWithOAuth({
      provider: 'google',
    });

    return {
      data: data,
      error: error,
    };
  }

  async signupUser(dto: CreateUserDto): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabaseClient.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          fullName: dto.fullName,
          address: dto.address,
          phoneNumber: dto.phone,
        },
      },
    });
    try {
      await this.userService.createUser(data.user.id, dto);
    } catch (error) {
      this.supabaseClient.auth.admin.deleteUser(data.user.id);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return {
      data: data,
      error: { ...error, message: error?.message },
    };
  }

  async createUserData(id: string, data: CreateUserDto) {
    return await this.userService.createUser(id, data);
  }

  async findUserById(id: string) {
    return await this.userService.getUserById(id);
  }

  async signOutUser() {
    const { error } = await this.supabaseClient.auth.signOut();
    return {
      error: error,
    };
  }
}
