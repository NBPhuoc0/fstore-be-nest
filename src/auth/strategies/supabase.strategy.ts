import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import {
  SupabaseAuthStrategy,
  SupabaseAuthUser,
} from 'nestjs-supabase-auth-v2';
import { AuthUser } from '@supabase/supabase-js';
import { Request } from 'express';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(
  SupabaseAuthStrategy,
  'supabase',
) {
  public constructor() {
    super({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: SupabaseAuthUser): Promise<any> {
    let res = super.validate(payload);
    return res;
  }

  authenticate(req: Request): void {
    let res = super.authenticate(req);
    return res;
  }
}
