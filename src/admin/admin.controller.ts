import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ProductService } from 'src/product/services/product.service';
import { ProductUtilsService } from 'src/product/services/product-utils.service';
import { ApiTags } from '@nestjs/swagger';


@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly productService: ProductService,
    private readonly productUtilService: ProductUtilsService,
  ) {}


  //* Brand
  @ApiTags('Brand')
  @Get('brands')
  findAllBrands() {
    return this.productUtilService.getBrands();
  }

  @ApiTags('Brand')
  @Get('brands/:id')
  findOneBrand(@Param('id') id: string) {
    return this.productUtilService.getBrandById(+id);
  }

  @ApiTags('Brand')
  @Post('brands')
  createBrand(@Body() createBrandDto: any) {
    return this.productUtilService.createBrand(createBrandDto);
  }

  @ApiTags('Brand')
  @Patch('brands/:id')
  updateBrand(@Body() updateBrandDto: any, @Param('id') id: string) {
    return this.productUtilService.updateBrand(+id, updateBrandDto);
  }

  @ApiTags('Brand')
  @Delete('brands/:id')
  removeBrand(@Param('id') id: string) {
    return this.productUtilService.deleteBrand(+id);
  }

  //* Category

  @ApiTags('Category')
  @Get('categories')
  findAllCategories() {
    return this.productUtilService.getCategories();
  }

  @ApiTags('Category')
  @Get('categories/:id')
  findOneCategory(@Param('id') id: string) {
    return this.productUtilService.getCategoryById(+id);
  }

  @ApiTags('Category')
  @Post('categories')
  createCategory(@Body() createCategoryDto: any) {
    return this.productUtilService.createCategory(createCategoryDto);
  }

  @ApiTags('Category')
  @Patch('categories/:id')
  updateCategory(@Body() updateCategoryDto: any, @Param('id') id: string) {
    return this.productUtilService.updateCategory(+id, updateCategoryDto);
  }

  @ApiTags('Category')
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.productUtilService.deleteCategory(+id);
  }

  //* Color

  @ApiTags('Color')
  @Get('colors')
  findAllColors() {
    return this.productUtilService.getColors();
  }

  @ApiTags('Color')
  @Get('colors/:id')
  findOneColor(@Param('id') id: string) {
    return this.productUtilService.getColorById(+id);
  }

  @ApiTags('Color')
  @Post('colors')
  createColor(@Body() createColorDto: any) {
    return this.productUtilService.createColor(createColorDto);
  }

  @ApiTags('Color')
  @Patch('colors/:id')
  updateColor(@Body() updateColorDto: any, @Param('id') id: string) {
    return this.productUtilService.updateColor(+id, updateColorDto);
  }

  @ApiTags('Color')
  @Delete('colors/:id')
  removeColor(@Param('id') id: string) {
    return this.productUtilService.deleteColor(+id);
  }

  //* Size
    @ApiTags('Size')
  @Get('sizes')
  findAllSizes() {
    return this.productUtilService.getSizes();
  }

  @ApiTags('Size')
  @Get('sizes/:id')
  findOneSize(@Param('id') id: string) {
    return this.productUtilService.getSizeById(+id);
  }

  @ApiTags('Size')
  @Post('sizes')
  createSize(@Body() createSizeDto: any) {
    return this.productUtilService.createSize(createSizeDto);
  }

  @ApiTags('Size')
  @Patch('sizes/:id')
  updateSize(@Body() updateSizeDto: any, @Param('id') id: string) {
    return this.productUtilService.updateSize(+id, updateSizeDto);
  }

  @ApiTags('Size')
  @Delete('sizes/:id')
  removeSize(@Param('id') id: string) {
    return this.productUtilService.deleteSize(+id);
  }

  // * Product

}
