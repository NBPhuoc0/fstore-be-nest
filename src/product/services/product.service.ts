import { Inject, Injectable } from '@nestjs/common';
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
  ProductColor,
  ProductVariant,
  Size,
} from 'src/entities';
import { Photo } from 'src/entities/photo.entity';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductColor)
    private productColorRepository: Repository<ProductColor>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
    @InjectRepository(Color)
    private colorRepository: Repository<Color>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    private dataSource: DataSource,
  ) {}

  async getProducts() {
    return this.productRepository.find();
  }

  async getProductById(id: number) {
    return this.productRepository.findBy({ id });
  }

  async createProduct(dto: CreateProdDto) {
    const product = this.productRepository.create();

    product.name = dto.name;
    product.metaDesc = dto.metaDesc;
    product.originalPrice = dto.originalPrice;

    // await product.save();
    const colors = await this.colorRepository.find({
      where: { id: In(dto.colorIds) },
    });
    const sizes = await this.sizeRepository.find({
      where: { id: In(dto.sizeIds) },
    });

    //* Color relation
    product.colors = [];
    for (const color of colors) {
      const productColor = this.productColorRepository.create();
      productColor.color = color;
      product.colors.push(productColor);
    }

    //* Size relation
    product.sizes = [];
    for (const size of sizes) {
      product.sizes.push(size);
    }

    for (const color of colors) {
      for (const size of sizes) {
        const productVariant = this.productVariantRepository.create();
        productVariant.code = product.code + color + size;
        productVariant.product = product;
        productVariant.inventoryQuantity = 100; //todo:
        // productVariant.save();
        productVariant.color = color;
        productVariant.size = size;
      }
    }

    await product.save();

    //* Brand relation
    this.dataSource
      .createQueryBuilder()
      .relation(Product, 'brand')
      .of(product)
      .add({ id: dto.brandId });

    //* Category relation
    this.dataSource
      .createQueryBuilder()
      .relation(Product, 'category')
      .of(product)
      .add({ id: dto.categoryId });
  }

  async updateProductColorPhoto(prodId: number, colorId: number, url: string) {
    return await this.productColorRepository.update(
      {
        product: {
          id: prodId,
        },
        color: {
          id: colorId,
        },
      },
      { url },
    );
  }
  async updateProductVariantPhoto(
    prodId: number,
    colorId: number,
    urls: string[],
  ) {
    const product = await this.productRepository.findOneBy({ id: prodId });

    const color = await this.colorRepository.findOneBy({ id: colorId });

    for (const i in urls) {
      const photo = this.photoRepository.create();
      photo.url = urls[i];
      photo.position = +i;
      photo.color = color;
      product.photos.push(photo);
      // await photo.save();
    }

    await product.save();
  }

  async updateProductInfo(id: number, data: UpdateProdDto) {
    return this.productRepository.update(id, data);
  }

  async deleteProduct(id: number) {
    return this.productRepository.delete(id);
  }
}
