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
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private dataSource: DataSource,
  ) {}

  private logger = new Logger('ProductService');

  async getProducts() {
    return this.productRepository.find();
  }

  async getProductById(id: number) {
    return this.productRepository.findBy({ id });
  }

  async createProduct(dto: CreateProdDto) {
    const product = new Product();

    product.name = dto.name;
    product.metaDesc = dto.metaDesc;
    product.originalPrice = dto.originalPrice;

    // await product.save();
    const colors = await this.colorRepository.findBy({
      id: In(dto.colors),
    });
    const sizes = await this.sizeRepository.findBy({
      id: In(dto.sizes),
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

    //* Brand relation
    product.brandId = dto.brand;

    //* Category relation
    product.categoryId = dto.category;

    //* Variant relation

    await product.save(); // get id

    product.variants = [];
    for (const color of colors) {
      for (const size of sizes) {
        const productVariant = this.productVariantRepository.create();
        productVariant.code = product.code + '-' + color.name + '-' + size.name;
        productVariant.inventoryQuantity = 100; //todo:
        // productVariant.save();
        productVariant.color = color;
        productVariant.size = size;

        product.variants.push(productVariant);
      }
    }
    await this.productRepository.save(product);
    return product;
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
    // return this.productRepository.update(id, data);
  }

  async deleteProduct(id: number) {
    return this.productRepository.delete(id);
  }
}
