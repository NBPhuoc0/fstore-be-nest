import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createBrandDto } from 'src/dto/req/create-brand.dto';
import { createCateDto } from 'src/dto/req/create-cate.dto';
import { createColorDto } from 'src/dto/req/create-color.dto';
import { createSizeDto } from 'src/dto/req/create-size.dto';
import { Brand, Category, Color, Size } from 'src/entities';
import { Photo } from 'src/entities/photo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductUtilsService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
    @InjectRepository(Color)
    private colorRepository: Repository<Color>
  ) {}
  //   ** BRAND **
  async getBrands() {
    return this.brandRepository.find();
  }

  async getBrandById(id: number) {
    return this.brandRepository.findOne({ where: { id } });
  }

  async createBrand(data: createBrandDto) {
    return this.brandRepository.save(data);
  }

  async updateBrand(id: number, data: Partial<createBrandDto>) {
    return this.brandRepository.update(id, data);
  }

  async deleteBrand(id: number) {
    return this.brandRepository.delete(id);
  }

  //   ** CATEGORY **
  async getCategories() {
    return this.categoryRepository.find({ relations: ['parent'] });
  }

  async getCategoryById(id: number) {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async createCategory(data: createCateDto) {
    // return this.categoryRepository.create(data).save();
    const category = this.categoryRepository.create();
    category.name = data.name;
    if (!data.parent) {
      return this.categoryRepository.save(category);
    }
    const parent = await this.categoryRepository.findOne({
      where: { id: data.parent },
    });
    if (!parent) {
      throw new BadRequestException('Parent category not found');
    }
    category.parent = parent;
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, data: Partial<createBrandDto>) {
    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: number) {
    return this.categoryRepository.delete(id);
  }

  //   ** SIZE **

  async getSizes() {
    return this.sizeRepository.find();
  }

  async getSizeById(id: number) {
    return this.sizeRepository.findOne({ where: { id } });
  }

  async createSize(data: createSizeDto) {
    return this.sizeRepository.save(data);
  }

  async updateSize(id: number, data: Partial<createSizeDto>) {
    return this.sizeRepository.update(id, data);
  }

  async deleteSize(id: number) {
    return this.sizeRepository.delete(id);
  }

  //   ** COLOR **
  async getColors() {
    return this.colorRepository.find();
  }

  async getColorById(id: number) {
    return this.colorRepository.findOne({ where: { id } });
  }

  async createColor(data: createColorDto) {
    return this.colorRepository.save(data);
  }

  async updateColor(id: number, data: Partial<createColorDto>) {
    return this.colorRepository.update(id, data);
  }

  async deleteColor(id: number) {
    return this.colorRepository.delete(id);
  }
}
