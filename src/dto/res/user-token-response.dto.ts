import { Expose, Transform, Type } from 'class-transformer';

export class UserTokenResponse {
  @Expose({ name: 'access_token' })
  accessToken: string;

  @Expose({ name: 'refresh_token' })
  refreshToken: string;

  @Expose({ name: 'expires_at' })
  expiresAt: number;

  @Expose()
  @Transform(({ obj }) => obj.user?.id)
  userId: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.user_metadata?.isAdmin ?? false)
  isAdmin: boolean;
}
