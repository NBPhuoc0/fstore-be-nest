import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { S3ClientService } from 'src/common/services/s3-client.service';
import { CreateProdDto } from 'src/dto/req/create-prod.dto';
import { UpdateProdDto } from 'src/dto/req/update-prod.dto';
import { PaginatedResponse } from 'src/dto/res/paginated-response.dto';
import { Color, Inventory, Product, ProductVariant, Size } from 'src/entities';
import { Photo } from 'src/entities/photo.entity';
import { DataSource, In } from 'typeorm';
import { ProductUtilsService } from './product-utils.service';

@Injectable()
export class ProductService {
  constructor(
    private dataSource: DataSource,
    private readonly s3ClientService: S3ClientService,
    private readonly productUtilsService: ProductUtilsService,
  ) {}

  private getFirst4Char(str: string): string {
    const words = str.split('-');
    return words
      .slice(0, 4)
      .map((word) => word[0].toUpperCase())
      .join('');
  }
  private logger = new Logger('ProductService');

  // lấy tất cả sản phẩm theo phân trang
  async getProducts(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Product[];
    total: number;
  }> {
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const [data, total] = await Product.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'ASC', // tuỳ bạn có thể thêm sắp xếp
      },
    });

    return {
      data,
      total,
    };
  }

  // lấy tất cả sản phẩm
  async getAllProducts(): Promise<Product[]> {
    return Product.find({
      relations: [
        'category',
        'brand',
        'photos',
        'variants',
        'variants.color',
        'variants.size',
        'colors',
        'sizes',
      ],
      order: {
        id: 'ASC',
      },
    });
  }

  // lấy sản phẩm theo bộ lọc
  async getProductsWithFilter(
    page?: number,
    limit?: number,
    category?: string,
    brand?: string,
    color?: string,
    size?: string,
    orderType?: number, // 1: price ASC, 2: price DESC, 3: newest, 4: oldest
  ): Promise<PaginatedResponse<Product>> {
    if (!orderType || orderType < 1 || orderType > 4) {
      orderType = 4;
    }
    const orderOptions: Record<
      number,
      { sort: string; order: 'ASC' | 'DESC' }
    > = {
      1: { sort: 'originalPrice', order: 'ASC' }, // Giá tăng dần
      2: { sort: 'originalPrice', order: 'DESC' }, // Giá giảm dần
      3: { sort: 'createdDate', order: 'DESC' }, // Mới nhất
      4: { sort: 'createdDate', order: 'ASC' }, // Cũ nhất
    };
    page = Number(page) || 0; // Mặc định trang đầu tiên
    limit = Number(limit) || 12; // Mặc định số lượng sản phẩm mỗi trang
    const { sort, order } = orderOptions[orderType];
    const query = this.dataSource
      .createQueryBuilder(Product, 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.photos', 'photo')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.colors', 'colors')
      .leftJoinAndSelect('variants.color', 'color')
      .leftJoinAndSelect('variants.size', 'size')
      .where('product.display = true')
      .orderBy('product.' + sort, order) //
      .take(limit) // Giới hạn số lượng sản phẩm trả về
      .skip(page * limit); // Bỏ qua số lượng sản phẩm đã hiển thị

    // Lọc theo category
    if (category) {
      const childrenCategories =
        await this.productUtilsService.getChildrenCategoriesArr(+category);
      if (childrenCategories.length > 1) {
        query.andWhere('category.id IN (:...childrenCategories)', {
          childrenCategories,
        });
      } else query.andWhere('category.id = :category', { category });
    }

    // Lọc theo brand
    if (brand) {
      query.andWhere('brand.id = :brand', { brand });
    }

    // Lọc theo color (màu sắc từ ProductVariant)
    if (color) {
      query.andWhere('color.id = :color', { color });
    }

    // Lọc theo size (kích thước từ ProductVariant)
    if (size) {
      query.andWhere('size.id = :size', { size });
    }

    // Lấy kết quả và tổng số sản phẩm

    // this.logger.log(query.getQueryAndParameters()); // Log the query for debugging
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
    return Product.findOne({
      where: { id },
      relations: [
        'category',
        'brand',
        'photos',
        'variants',
        'variants.color',
        'variants.size',
        'colors',
        'sizes',
        // 'variants.inventory',
      ],
    });
  }

  async getProductWithInventory(productId: number) {
    const product = await Product.findOne({
      where: { id: productId },
      relations: ['variants', 'brand', 'category', 'photos'], // các relations khác
    });

    if (!product) throw new NotFoundException('Product not found');

    for (const variant of product.variants) {
      const { sum } = await Inventory.createQueryBuilder('batch')
        .select('SUM(batch.remainingQuantity)', 'sum')
        .where('batch.variantId = :variantId', { variantId: variant.id })
        .getRawOne();

      variant['stockQuantity'] = Number(sum) || 0;
    }

    return product;
  }

  async getProductsByIds(ids: number[]): Promise<Product[]> {
    // if (!ids || ids.length === 0) {
    //   throw new BadRequestException('Product IDs are required');
    // }
    return Product.findBy({
      id: In(ids),
    });
  }

  async getIdsandNames(): Promise<{ id: number; name: string }[]> {
    return Product.createQueryBuilder('product')
      .select(['product.id', 'product.name'])
      .getMany()
      .then((products) =>
        products.map((product) => ({
          id: product.id,
          name: product.name,
        })),
      );
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
          // productVariant.inventoryQuantity = 100; //todo:
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

  // cập nhật giá sản phẩm
  async updateProductPrice(id: number, originalPrice: number): Promise<string> {
    if (originalPrice < 0) {
      throw new BadRequestException('Original price must be greater than 0');
    }
    return (await Product.update(id, { originalPrice })).raw;
  }

  async updateDisplayStatus(
    id: number,
    displayStatus: boolean,
  ): Promise<string> {
    return Product.update(id, { display: displayStatus }).then(
      (res) => res.raw,
    );
  }

  // xóa sản phẩm
  async deleteProduct(id: number): Promise<string> {
    return (await Product.delete(id)).raw;
  }
}
