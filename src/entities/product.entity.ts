import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  AfterInsert,
} from 'typeorm';
import { Promotion } from './promotion.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { Size } from './size.entity';
import { ProductColor } from './product-color.entity';
import { ProductVariant } from './product-variant.entity';
import { Photo } from './photo.entity';
import slugify from 'slugify';

@Entity('products')
@Index('idx_unique_code', ['code'], { unique: true })
@Index('idx_unique_url_handle', ['urlHandle'], { unique: true })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  urlHandle: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  metaDesc: string;

  @Column({ default: true })
  display: boolean;

  @Column({ default: true })
  inventoryStatus: boolean;

  @Column({ nullable: false, type: 'decimal' })
  originalPrice: number;

  @Column({ type: 'decimal' })
  salePrice: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(() => Promotion, (promotion) => promotion.products)
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, { nullable: false })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToMany(() => Size, { nullable: false, cascade: true })
  @JoinTable({
    name: 'product_size',
    joinColumns: [{ name: 'product_id' }],
    inverseJoinColumns: [{ name: 'size_id' }],
  })
  sizes: Size[];

  @OneToMany(() => ProductColor, (productColor) => productColor.product, {
    orphanedRowAction: 'delete',
    cascade: true,
    eager: true,
  })
  colors: ProductColor[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    orphanedRowAction: 'delete',
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => Photo, (image) => image.product, {
    orphanedRowAction: 'delete',
    cascade: true,
  })
  photos: Photo[];

  @AfterInsert()
  async generateUrlHandle() {
    this.urlHandle =
      slugify(this.name, { lower: true, locale: 'vi' }) + '-' + this.id;
    this.code = getFirst4Char(this.name);
    await this.save();
  }
}

function getFirst4Char(str: string): string {
  const words = str.split('-');
  return words
    .slice(0, 4)
    .map((word) => word[0].toUpperCase())
    .join('');
}
