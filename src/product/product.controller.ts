import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { CacheService } from 'src/common/services/cache.service';

@Controller('product')
export class ProductController {
  private logger = new Logger('ProductController');
  constructor(
    private readonly productService: ProductService,
    private readonly cacheService: CacheService,
  ) {}

  // get all products
  @Get()
  async findAllProducts() {
    return this.productService.getProducts();
  }

  @Get('/:id')
  async findOneProduct(@Param('id') id: string) {
    this.cacheService.set('product-get', id);
    const cachedProduct = await this.cacheService.get('product/' + id);
    if (cachedProduct) {
      this.logger.log('Product found in cache');
      return cachedProduct;
    }
    this.logger.log('Product not found in cache');
    const prod = await this.productService.getProductById(+id);
    this.cacheService.set('product/' + id, prod);
    return prod;
  }
}
