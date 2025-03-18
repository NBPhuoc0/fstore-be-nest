import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Logger,
  UseGuards,
  Req,
  HttpException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ProductService } from 'src/product/services/product.service';
import { ProductUtilsService } from 'src/product/services/product-utils.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateProdDto } from 'src/dto/req/create-prod.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { createCateDto } from 'src/dto/req/create-cate.dto';
import { createColorDto } from 'src/dto/req/create-color.dto';
import { S3ClientService } from 'src/common/services/s3-client.service';
import { AdminAuthGuard } from 'src/auth/guards/admin.auth.guard';

@ApiBearerAuth('Authorization')
// @UseGuards(AdminAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly productService: ProductService,
    private readonly productUtilService: ProductUtilsService,
    private readonly s3ClientService: S3ClientService,
  ) {}

  private logger = new Logger('AdminController');
  //* test auth
  @Get('test')
  @ApiBearerAuth('Authorization')
  async test(@Req() req) {
    return req.user;
  }

  //* Brand

  // get all brands
  @ApiTags('Brand')
  @Get('brands')
  findAllBrands() {
    return this.productUtilService.getBrands();
  }

  // get brand by id
  @ApiTags('Brand')
  @Get('brands/:id')
  findOneBrand(@Param('id') id: string) {
    return this.productUtilService.getBrandById(+id);
  }

  // create brand
  @ApiTags('Brand')
  @Post('brands')
  createBrand(@Body() createBrandDto: any) {
    return this.productUtilService.createBrand(createBrandDto);
  }

  // update brand by id
  @ApiTags('Brand')
  @Patch('brands/:id')
  updateBrand(@Body() updateBrandDto: any, @Param('id') id: string) {
    return this.productUtilService.updateBrand(+id, updateBrandDto);
  }

  // delete brand by id
  @ApiTags('Brand')
  @Delete('brands/:id')
  removeBrand(@Param('id') id: string) {
    return this.productUtilService.deleteBrand(+id);
  }

  //* Category

  // get all categories
  @ApiTags('Category')
  @Get('categories')
  findAllCategories() {
    return this.productUtilService.getCategories();
  }

  // get category by id
  @ApiTags('Category')
  @Get('categories/:id')
  findOneCategory(@Param('id') id: string) {
    return this.productUtilService.getCategoryById(+id);
  }

  // create category
  @ApiTags('Category')
  // @UseGuards(AdminAuthGuard)
  @Post('categories')
  createCategory(@Body() createCategoryDto: any) {
    return this.productUtilService.createCategory(createCategoryDto);
    // throw new HttpException('Not implemented', 500);
  }

  // update category by id
  @ApiTags('Category')
  @Patch('categories/:id')
  updateCategory(@Body() updateCategoryDto: any, @Param('id') id: string) {
    return this.productUtilService.updateCategory(+id, updateCategoryDto);
  }

  // delete category by id
  @ApiTags('Category')
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.productUtilService.deleteCategory(+id);
  }

  //* Color

  // get all colors
  @ApiTags('Color')
  @Get('colors')
  findAllColors() {
    return this.productUtilService.getColors();
  }

  // get color by id
  @ApiTags('Color')
  @Get('colors/:id')
  findOneColor(@Param('id') id: string) {
    return this.productUtilService.getColorById(+id);
  }

  // create color
  @ApiTags('Color')
  @Post('colors')
  createColor(@Body() createColorDto: any) {
    return this.productUtilService.createColor(createColorDto);
  }

  // update color by id
  @ApiTags('Color')
  @Patch('colors/:id')
  updateColor(@Body() updateColorDto: any, @Param('id') id: string) {
    return this.productUtilService.updateColor(+id, updateColorDto);
  }

  // delete color by id
  @ApiTags('Color')
  @Delete('colors/:id')
  removeColor(@Param('id') id: string) {
    return this.productUtilService.deleteColor(+id);
  }

  //* Size

  // get all sizes
  @ApiTags('Size')
  @Get('sizes')
  findAllSizes() {
    return this.productUtilService.getSizes();
  }

  // get size by id
  @ApiTags('Size')
  @Get('sizes/:id')
  findOneSize(@Param('id') id: string) {
    return this.productUtilService.getSizeById(+id);
  }

  // create size
  @ApiTags('Size')
  @UseGuards(AdminAuthGuard)
  @Post('sizes')
  createSize(@Body() createSizeDto: any) {
    return this.productUtilService.createSize(createSizeDto);
  }

  // update size by id
  @ApiTags('Size')
  @Patch('sizes/:id')
  updateSize(@Body() updateSizeDto: any, @Param('id') id: string) {
    return this.productUtilService.updateSize(+id, updateSizeDto);
  }

  // delete size by id
  @ApiTags('Size')
  @Delete('sizes/:id')
  removeSize(@Param('id') id: string) {
    return this.productUtilService.deleteSize(+id);
  }

  // * Product

  // get all products
  @ApiTags('Product')
  @Get('products')
  findAllProducts() {
    return this.productService.getProducts();
  }

  // get product by id
  @ApiTags('Product')
  @Get('products/:id')
  findOneProduct(@Param('id') id: number) {
    return this.productService.getProductById(+id);
  }

  // create product
  @ApiTags('Product')
  @Post('products')
  async createProduct(@Body() createProductDto: CreateProdDto) {
    // let tset = { ...createProductDto };
    // this.logger.log(tset);
    return await this.productService.createProduct(createProductDto);
  }

  // update product by id
  @ApiTags('Product')
  @Patch('products/:id')
  updateProduct(@Body() updateProductDto: any, @Param('id') id: string) {
    return this.productService.updateProductInfo(+id, updateProductDto);
  }

  // update product variant photo
  @ApiTags('Product')
  @UseInterceptors(FilesInterceptor('files'))
  @Patch('products/:prod/variant/:color')
  updateProductVariantPhoto(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('prod') id: number,
    @Param('color') color: number,
  ) {
    return this.productService.updateProductVariantPhoto(id, color, files);
  }

  @ApiTags('Product')
  @Delete('products/:id')
  removeProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(+id);
  }
}
