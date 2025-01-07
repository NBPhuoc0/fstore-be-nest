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
import { createSizeDto } from 'src/dto/create-size.dto';

@Controller('sizes')
export class SizeController {
  constructor(private readonly productUtilsService: ProductUtilsService) {}

  @Post()
  create(@Body() createSizeDto: createSizeDto) {
    return this.productUtilsService.createSize(createSizeDto);
  }

  @Get()
  findAll() {
    return this.productUtilsService.getSizes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productUtilsService.getSizeById(+id);
  }

  @Put(':id')
  update(@Body() updateSizeDto: createSizeDto, id: string) {
    return this.productUtilsService.updateSize(+id, updateSizeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productUtilsService.deleteSize(+id);
  }
}
