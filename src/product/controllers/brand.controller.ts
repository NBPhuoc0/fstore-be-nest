import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductUtilsService } from '../services/product-utils.service';
import { createBrandDto } from 'src/dto/create-brand.dto';

@Controller('brands')
export class BrandController {
  constructor(private readonly productUtilsService: ProductUtilsService) {}

  @Get()
  findAll() {
    return this.productUtilsService.getBrands();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productUtilsService.getBrandById(+id);
  }

  @Post()
  create(@Body() createBrandDto: createBrandDto) {
    return this.productUtilsService.createBrand(createBrandDto);
  }

  @Put(':id')
  update(@Body() updateBrandDto: createBrandDto, id: string) {
    return this.productUtilsService.updateBrand(+id, updateBrandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productUtilsService.deleteBrand(+id);
  }
}
