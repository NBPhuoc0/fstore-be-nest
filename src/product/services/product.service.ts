import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createBrandDto } from 'src/dto/req/create-brand.dto';
import { createColorDto } from 'src/dto/req/create-color.dto';
import { CreateProdDto } from 'src/dto/req/create-prod.dto';
import { createSizeDto } from 'src/dto/req/create-size.dto';
import { UpdateProdDto } from 'src/dto/req/update-prod.dto';
import {
  Brand,
  Category,
  Color,
  Product,
  ProductVariant,
  Size,
} from 'src/entities';
import { Photo } from 'src/entities/photo.entity';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(private dataSource: DataSource) {}

  private logger = new Logger('ProductService');

  async getProducts() {
    return Product.find();
  }

  async getProductById(id: number) {
    return Product.findBy({ id });
  }

  async createProduct(dto: CreateProdDto) {
    const product = new Product();

    product.name = dto.name;
    product.metaDesc = dto.metaDesc;
    product.originalPrice = dto.originalPrice;

    // await product.save();
    const colors = await Color.findBy({
      id: In(dto.colors),
    });
    const sizes = await Size.findBy({
      id: In(dto.sizes),
    });

    //* Color relation
    product.colors = [];
    for (const color of colors) {
      product.colors.push(color);
    }

    //* Size relation
    product.sizes = [];
    for (const size of sizes) {
      product.sizes.push(size);
    }

    //* Brand relation
    product.brandId = dto.brand;

    //* Category relation
    product.categoryId = dto.category;

    //* Variant relation

    await product.save(); // get id

    product.variants = [];
    for (const color of colors) {
      for (const size of sizes) {
        const productVariant = ProductVariant.create();
        productVariant.code = product.code + '-' + color.name + '-' + size.name;
        productVariant.inventoryQuantity = 100; //todo:
        // productVariant.save();
        productVariant.color = color;
        productVariant.size = size;

        product.variants.push(productVariant);
      }
    }
    await Product.save(product);
    return product;
  }

  async updateProductVariantPhoto(
    prodId: number,
    colorId: number,
    urls: string[],
  ) {
    const product = await Product.findOneBy({ id: prodId });

    const color = await Color.findOneBy({ id: colorId });

    for (const i in urls) {
      const photo = Photo.create();
      photo.url = urls[i];
      photo.position = +i;
      photo.color = color;
      product.photos.push(photo);
      // await photo.save();
    }

    await product.save();
  }

  async updateProductInfo(id: number, data: UpdateProdDto) {
    // return Product.update(id, data);
  }

  async deleteProduct(id: number) {
    return Product.delete(id);
  }
}
