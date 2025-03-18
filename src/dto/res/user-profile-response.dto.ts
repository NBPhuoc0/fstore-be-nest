import { Expose, Type } from 'class-transformer';

export class UserProfileResponse {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  address: string;

  @Expose()
  @Type(() => CartItemResponse)
  cart: CartItemResponse[];
}

class CartItemResponse {
  @Expose()
  variantId: string;

  @Expose()
  productId: string;

  @Expose()
  quantity: string;
}
