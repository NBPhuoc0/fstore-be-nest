import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  name: string;
}
