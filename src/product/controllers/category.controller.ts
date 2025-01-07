import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Logger,
} from '@nestjs/common';
import { ProductUtilsService } from '../services/product-utils.service';
import { createCateDto } from 'src/dto/create-cate.dto';
import { UpdateCateDto } from 'src/dto/update-cate.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly prodUtilsService: ProductUtilsService) {}

  private logger = new Logger('CategoryController');
  @Post()
  create(@Body() createCategoryDto: createCateDto) {
    return this.prodUtilsService.createCategory(createCategoryDto);
  }

  @Get()
  findAll() {
    this.logger.log('Fetching all categories');
    return this.prodUtilsService.getCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prodUtilsService.getCategoryById(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCateDto) {
    return this.prodUtilsService.updateCategory(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prodUtilsService.deleteCategory(+id);
  }
}
