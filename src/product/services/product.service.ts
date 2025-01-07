import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createBrandDto } from 'src/dto/create-brand.dto';
import { createColorDto } from 'src/dto/create-color.dto';
import { createSizeDto } from 'src/dto/create-size.dto';
import {
  Brand,
  Category,
  Color,
  Product,
  ProductColor,
  Size,
} from 'src/entities';
import { Photo } from 'src/entities/photo.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ProductService {
  //   ** PRODUCT **
}
