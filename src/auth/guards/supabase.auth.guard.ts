import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class SupabaseAuthGuard extends AuthGuard('supabase') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
