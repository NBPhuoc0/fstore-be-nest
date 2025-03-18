import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { S3ClientService } from 'src/common/services/s3-client.service';
import { createBrandDto } from 'src/dto/req/create-brand.dto';
import { createColorDto } from 'src/dto/req/create-color.dto';
import { CreateProdDto } from 'src/dto/req/create-prod.dto';
import { createSizeDto } from 'src/dto/req/create-size.dto';
import { UpdateProdDto } from 'src/dto/req/update-prod.dto';
import { PaginatedResponse } from 'src/dto/res/paginated-response.dto';
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
  constructor(
    private dataSource: DataSource,
    private readonly s3ClientService: S3ClientService,
  ) {}

  private getFirst4Char(str: string): string {
    const words = str.split('-');
    return words
      .slice(0, 4)
      .map((word) => word[0].toUpperCase())
      .join('');
  }
  private logger = new Logger('ProductService');

  // lấy tất cả sản phẩm
  async getProducts(): Promise<Product[]> {
    return Product.find();
  }

  // lấy sản phẩm theo bộ lọc
  async getProductsWithFilter(
    page = 0,
    limit = 10,
    category?: string,
    brand?: string,
    color?: string,
    size?: string,
    orderType?: number, // 1: price ASC, 2: price DESC, 3: newest, 4: oldest
  ): Promise<PaginatedResponse<Product>> {
    if (!orderType || orderType < 1 || orderType > 4) {
      orderType = 3;
    }
    const orderOptions: Record<
      number,
      { sort: string; order: 'ASC' | 'DESC' }
    > = {
      1: { sort: 'original_price', order: 'ASC' }, // Giá tăng dần
      2: { sort: 'original_price', order: 'DESC' }, // Giá giảm dần
      3: { sort: 'created_at', order: 'DESC' }, // Mới nhất
      4: { sort: 'created_at', order: 'ASC' }, // Cũ nhất
    };
    const { sort, order } = orderOptions[orderType];
    const query = this.dataSource
      .createQueryBuilder(Product, 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.color', 'color')
      .leftJoinAndSelect('variants.size', 'size')
      .orderBy(sort, order) //
      .skip(page * limit)
      .take(limit);

    // Lọc theo category
    if (category) {
      query.andWhere('category.name = :category', { category });
    }

    // Lọc theo brand
    if (brand) {
      query.andWhere('brand.name = :brand', { brand });
    }

    // Lọc theo color (màu sắc từ ProductVariant)
    if (color) {
      query.andWhere('color.name = :color', { color });
    }

    // Lọc theo size (kích thước từ ProductVariant)
    if (size) {
      query.andWhere('size.name = :size', { size });
    }

    // Lấy kết quả và tổng số sản phẩm
    const [data, total] = await query.getManyAndCount();

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // lấy sản phẩm theo id
  async getProductById(id: number): Promise<Product> {
    return Product.findOneBy({ id });
  }

  // tạo mới sản phẩm
  async createProduct(dto: CreateProdDto): Promise<Product> {
    const product = Product.create();

    product.name = dto.name;
    product.metaDesc = dto.metaDesc;
    product.originalPrice = dto.originalPrice;

    // await product.save();
    const colors = await Color.findBy({
      id: In(dto.colorIds),
    });

    const sizes = await Size.findBy({
      id: In(dto.sizeIds),
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
    product.brandId = dto.brandId;

    //* Category relation
    product.categoryId = dto.categoryId;

    //* transaction to save product and product variants
    return await this.dataSource.manager.transaction(async (manager) => {
      await manager.save(product); // get product id

      // set product code
      product.urlHandle =
        slugify(product.name, { lower: true, locale: 'vi' }) + '-' + product.id;
      product.code = this.getFirst4Char(product.name) + '-' + product.id;

      // set product variants
      product.variants = [];
      for (const color of colors) {
        for (const size of sizes) {
          const productVariant = ProductVariant.create();
          productVariant.code =
            product.code + '-' + color.name + '-' + size.name;
          productVariant.inventoryQuantity = 100; //todo:
          // productVariant.save();
          productVariant.color = color;
          productVariant.size = size;

          product.variants.push(productVariant);
        }
      }
      return await manager.save(product);
    });
  }

  // thêm ảnh cho sản phẩm
  async updateProductVariantPhoto(
    prodId: number,
    colorId: number,
    files: Express.Multer.File[],
  ): Promise<Product> {
    await Color.findOneByOrFail({ id: colorId });
    const product = await Product.findOneByOrFail({ id: prodId });

    for (const i in files) {
      const photo = Photo.create();
      photo.url = this.s3ClientService.uploadFileToPublicBucket(
        `${product.code}/${colorId}/${i}`,
        files[i],
      );
      photo.position = +i;
      photo.colorId = colorId;
      product.photos.push(photo);
    }

    return await product.save();
  }

  // cập nhật thông tin sản phẩm
  async updateProductInfo(id: number, data: UpdateProdDto): Promise<string> {
    return (await Product.update(id, data)).raw;
  }

  // xóa sản phẩm
  async deleteProduct(id: number): Promise<string> {
    return (await Product.delete(id)).raw;
  }
}
