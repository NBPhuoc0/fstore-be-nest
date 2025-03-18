import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  AuthSession,
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';
import { CreateUserDto } from 'src/dto/req/create-user.dto';
import { SignInDto } from 'src/dto/req/sign-in.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private supabaseClient: SupabaseClient;
  private logger = new Logger('AuthService');
  constructor(private readonly userService: UserService) {
    this.supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  // đăng nhập với pass
  async signInUser(dto: SignInDto): Promise<AuthSession> {
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }

    return data.session;
  }

  // đăng nhập với gg
  async signInGG() {
    const { data, error } = await this.supabaseClient.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }

    return data;
  }

  // đăng ký mới với pass
  async signupUser(dto: CreateUserDto): Promise<AuthSession> {
    const { data, error } = await this.supabaseClient.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          fullName: dto.fullName,
          address: dto.address,
          phoneNumber: dto.phone,
          isAdmin: false,
        },
      },
    });
    if (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
    try {
      dto.provider = 'email';
      await this.userService.createUser(data.user.id, dto);
    } catch (error) {
      // this.supabaseClient.auth.admin.deleteUser(data.user.id);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return data.session;
  }

  // refresh token
  async refreshToken(refresh_token: string) {
    const { data, error } = await this.supabaseClient.auth.refreshSession({
      refresh_token,
    });
    if (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }

    return {
      data: data.session,
    };
  }

  // thêm thông tin user vào db sau khi đăng nhập bằng gg
  async createUserData(id: string, data: CreateUserDto) {
    return await this.userService.createUser(id, data);
  }

  // lấy thông tin user theo id
  async findUserById(id: string) {
    return await this.userService.getUserById(id);
  }

  // check admin user
  async checkAdminUser(id: string) {
    const res = await this.userService.getUserById(id);
    if (res.isAdmin ?? false) {
      return res;
    }
    return null;
  }

  // nâng quyền
  async upgradeUser(id: string) {
    const user = await this.supabaseClient.auth.admin.getUserById(id);
    this.logger.log(user);
    const updatedta = user.data.user;
    updatedta.user_metadata = {
      ...updatedta.user_metadata,
      isAdmin: true,
    };
    const { error } = await this.supabaseClient.auth.admin.updateUserById(
      updatedta.id,
      updatedta,
    );
    if (error) {
      throw new BadRequestException(error.message);
    }

    if (await this.userService.upgrateUserToAdmin(id))
      return {
        message: 'Upgrade successfully',
      };

    throw new BadRequestException('Upgrade failed');
  }

  // // đăng xuất
  // async signOutUser() {
  //   const { error } = await this.supabaseClient.auth.signOut();
  //   return {
  //     error: error,
  //   };
  // }
}
