import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/dto/req/create-user.dto';
import { SupabaseAuthGuard } from './guards/supabase.auth.guard';
import { SignInDto } from 'src/dto/req/sign-in.dto';
import { Request } from 'express';
import { RequestWithUser } from 'src/common/types';
import { AdminAuthGuard } from './guards/admin.auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('test')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  async test(@Req() req) {
    let x = 1;
    return req.user;
  }

  @Post('signIn')
  @ApiOperation({
    summary: 'Acquires an access token',
    description: 'This endpoint will provide an access token.',
  })
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signInUser(dto);
  }

  @Post('signIn/google')
  @ApiOperation({
    summary: 'Signs in the user with Google',
    description: 'This endpoint signs in the user with Google.',
  })
  async signInGG() {
    return this.authService.signInGG();
  }

  @Post('signUp')
  @ApiOperation({
    summary: 'Signs up the user in the system',
    description:
      'This endpoint signs up the user in the system. It will return the user details. You will use this user to interact with the rest of the endpoints.',
  })
  async signUp(@Body() dto: CreateUserDto) {
    return this.authService.signupUser(dto);
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Signs in the user with OAuth',
    description: 'This endpoint signs in the user with OAuth.',
  })
  async getProfile(@Req() req: RequestWithUser) {
    const user = req.user;
    let res = await this.authService.findUserById(user.id);

    if (res) {
      return res;
    }

    // nếu user chưa có trong db thì tạo mới (chỉ dành cho đăng nhập gg)
    if (user.app_metadata.provider == 'google') {
      const dto = new CreateUserDto();
      dto.email = user.email;
      dto.fullName = user.user_metadata.full_name;
      // dto.address = user.user_metadata.address;
      // dto.phone = user.user_metadata.phone_number;
      dto.avatar = user.user_metadata.avatar_url;
      dto.provider = user.app_metadata.provider;
      return this.authService.createUserData(user.id, dto);
    }

    throw new UnauthorizedException('User not found');
  }
}
