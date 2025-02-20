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
  BeforeInsert,
} from 'typeorm';
import { Promotion } from './promotion.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { Size } from './size.entity';
import { ProductVariant } from './product-variant.entity';
import { Photo } from './photo.entity';
import slugify from 'slugify';
import { Color } from './color.entity';

@Entity('products')
@Index('idx_unique_code', ['code'], { unique: true, nullFiltered: true })
@Index('idx_unique_url_handle', ['urlHandle'], { unique: true })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
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

  @Column({ type: 'decimal', nullable: true })
  salePrice: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ nullable: true })
  promotionId: number;

  @ManyToOne(() => Promotion, (promotion) => promotion.products, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({})
  promotion: Promotion;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (cate) => cate.products, {
    nullable: false,
    eager: true,
  })
  @JoinColumn()
  category: Category;

  @Column({ nullable: true })
  brandId: number;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({})
  brand: Brand;

  @ManyToMany(() => Size, { nullable: false, cascade: true, eager: true })
  @JoinTable({
    name: 'product_size',
    joinColumns: [{ name: 'product_id' }],
    inverseJoinColumns: [{ name: 'size_id' }],
  })
  sizes: Size[];

  @ManyToMany(() => Color, { nullable: false, cascade: true, eager: true })
  @JoinTable({
    name: 'product_color',
    joinColumns: [{ name: 'product_id' }],
    inverseJoinColumns: [{ name: 'color_id' }],
  })
  colors: Color[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    orphanedRowAction: 'delete',
    cascade: true,
    eager: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => Photo, (image) => image.product, {
    orphanedRowAction: 'delete',
    cascade: true,
    eager: true,
  })
  photos: Photo[];

  @AfterInsert()
  generateUrlHandle() {
    this.urlHandle =
      slugify(this.name, { lower: true, locale: 'vi' }) + '-' + this.id;
    this.code = getFirst4Char(this.name) + '-' + this.id;
    this.save();
  }
}

function getFirst4Char(str: string): string {
  const words = str.split('-');
  return words
    .slice(0, 4)
    .map((word) => word[0].toUpperCase())
    .join('');
}
