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
import { createColorDto } from 'src/dto/create-color.dto';

@Controller('colors')
export class ColorController {
  constructor(private readonly productUtilsService: ProductUtilsService) {}

  @Post()
  create(@Body() createColorDto: createColorDto) {
    return this.productUtilsService.createColor(createColorDto);
  }

  @Get()
  findAll() {
    return this.productUtilsService.getColors();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productUtilsService.getColorById(+id);
  }

  @Put(':id')
  update(@Body() updateColorDto: createColorDto, id: string) {
    return this.productUtilsService.updateColor(+id, updateColorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productUtilsService.deleteColor(+id);
  }
}
