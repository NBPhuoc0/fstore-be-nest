import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createBrandDto } from 'src/dto/req/create-brand.dto';
import { createCateDto } from 'src/dto/req/create-cate.dto';
import { createColorDto } from 'src/dto/req/create-color.dto';
import { createSizeDto } from 'src/dto/req/create-size.dto';
import { Brand, Category, Color, Size } from 'src/entities';
import { Photo } from 'src/entities/photo.entity';
import { Repository, TypeORMError } from 'typeorm';

@Injectable()
export class ProductUtilsService {
  constructor() {}
  //   ** BRAND **
  async getBrands() {
    return Brand.find();
  }

  async getBrandById(id: number) {
    return Brand.findOne({ where: { id } });
  }

  async createBrand(data: createBrandDto) {
    return Brand.save({ ...data });
  }

  async updateBrand(id: number, data: Partial<createBrandDto>) {
    return Brand.update(id, data);
  }

  async deleteBrand(id: number) {
    return Brand.delete(id);
  }

  //   ** CATEGORY **
  async getCategories() {
    return Category.find({
      relations: ['parent'],
      order: { id: 'asc' },
    });
  }

  async getCategoryById(id: number) {
    return Category.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
  }

  async getChildrenCategoriesArr(id: number) {
    const res = await Category.findOne({
      where: { id },
      relations: ['children'],
    });
    const childIds = res.children.map((child) => child.id);

    return [id, ...childIds];
  }

  async createCategory(data: createCateDto) {
    // return Category.create(data).save();
    const category = Category.create();
    category.name = data.name;
    if (!data.parent) {
      return Category.save(category);
    }
    const parent = await Category.findOne({
      where: { id: data.parent },
    });
    if (!parent) {
      throw new BadRequestException('Parent category not found');
    }
    category.parent = parent;
    return Category.save(category);
  }

  async updateCategory(id: number, data: Partial<createBrandDto>) {
    return Category.update(id, data);
  }

  async deleteCategory(id: number) {
    return Category.delete(id);
  }

  //   ** SIZE **

  async getSizes() {
    return Size.find();
  }

  async getSizeById(id: number) {
    return Size.findOne({ where: { id } });
  }

  async createSize(data: createSizeDto) {
    return Size.save({ ...data });
  }

  async updateSize(id: number, data: Partial<createSizeDto>) {
    return Size.update(id, data);
  }

  async deleteSize(id: number) {
    return Size.delete(id);
  }

  //   ** COLOR **
  async getColors() {
    return Color.find();
  }

  async getColorById(id: number) {
    return Color.findOne({ where: { id } });
  }

  async createColor(data: createColorDto) {
    return Color.save({ ...data });
  }

  async updateColor(id: number, data: Partial<createColorDto>) {
    return Color.update(id, data);
  }

  async deleteColor(id: number) {
    return Color.delete(id);
  }
}
