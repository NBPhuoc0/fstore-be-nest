import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Brand,
  Category,
  Color,
  Photo,
  Product,
  Size,
  ProductVariant,
} from 'src/entities';
import { ProductUtilsService } from './services/product-utils.service';

@Module({
  imports: [],
  controllers: [ProductController],
  providers: [ProductService, ProductUtilsService],
  exports: [ProductService, ProductUtilsService],
})
export class ProductModule {}
