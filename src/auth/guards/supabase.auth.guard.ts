import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SupabaseAuthGuard extends AuthGuard('supabase') {
  // handleRequest(err: any, user: any) {
  //   if (err || !user) {
  //     throw err || new UnauthorizedException();
  //   }
  //   return user;
  // }
}
