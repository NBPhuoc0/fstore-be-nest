import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { CacheService } from 'src/common/services/cache.service';
import { json } from 'express';
import { PaginatedResponse } from 'src/dto/res/paginated-response.dto';
import { Product } from 'src/entities';
import { CachePatterns } from 'src/common/enums';
import { ProductUtilsService } from './services/product-utils.service';

@Controller('product')
export class ProductController {
  private logger = new Logger('ProductController');
  constructor(
    private readonly productService: ProductService,
    private readonly cacheService: CacheService,
    private readonly productUtilsService: ProductUtilsService, // Assuming this is the correct service for product utils
  ) {}

  // get all products
  @Get()
  async findAllProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('color') color?: string,
    @Query('size') size?: string,
    @Query('orderType') orderType?: number,
  ): Promise<PaginatedResponse<Product>> {
    return this.productService.getProductsWithFilter(
      page,
      limit,
      category,
      brand,
      color,
      size,
      orderType,
    );
  }

  @Get('test/:id')
  async test(@Param('id') id: number) {
    return await this.productUtilsService.getChildrenCategoriesArr(id);
  }

  @Get('/:id')
  async findOneProduct(@Param('id') id: number) {
    await this.cacheService.set(
      'product-get',
      id,
      CachePatterns.ProductViewDaily,
    );
    const cachedProduct = await this.cacheService.get(
      'product/' + id,
      CachePatterns.Product,
    );
    if (cachedProduct) {
      this.logger.log('Product found in cache');
      return JSON.parse(cachedProduct);
    }
    this.logger.log('Product not found in cache');
    const prod = await this.productService.getProductById(+id);
    this.cacheService.set(
      'product/' + id,
      JSON.stringify(prod),
      CachePatterns.Product,
      86400,
    );
    return prod;
  }
}
