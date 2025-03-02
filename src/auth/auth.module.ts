import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { UserModule } from 'src/user/user.module';
import { AdminStrategy } from './strategies/admin.strategy';

@Module({
  imports: [PassportModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseStrategy, AdminStrategy],
  exports: [AuthService, SupabaseStrategy],
})
export class AuthModule {}
