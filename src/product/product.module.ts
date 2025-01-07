import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Brand,
  Category,
  Color,
  Photo,
  Product,
  ProductColor,
  Size,
  ProductVariant,
} from 'src/entities';
import { CategoryController } from './controllers/category.controller';
import { ProductUtilsService } from './services/product-utils.service';
import { BrandController } from './controllers/brand.controller';
import { SizeController } from './controllers/size.controller';
import { ColorController } from './controllers/color.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Brand,
      Size,
      Color,
      ProductColor,
      ProductVariant,
      Photo,
    ]),
  ],
  controllers: [
    ProductController,
    CategoryController,
    BrandController,
    SizeController,
    ColorController,
  ],
  providers: [ProductService, ProductUtilsService],
})
export class ProductModule {}
