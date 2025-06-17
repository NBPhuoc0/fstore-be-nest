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
import { Color } from './color.entity';

@Entity('products')
@Index('idx_prod_unique_code', ['code'], { unique: true, nullFiltered: true })
@Index('idx_prod_unique_url_handle', ['urlHandle'], {
  unique: true,
  nullFiltered: true,
})
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true, name: 'url_handle' })
  urlHandle: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, name: 'meta_desc' })
  metaDesc: string;

  @Column({ default: true })
  display: boolean;

  // @Column({ default: true, name: 'inventory_status' })
  // inventoryStatus: boolean;

  @Column({ nullable: false, type: 'decimal', name: 'original_price' })
  originalPrice: number;

  @Column({ type: 'decimal', nullable: true, name: 'sale_price' })
  salePrice: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;

  @Column({ nullable: true, name: 'promotion_id' })
  promotionId: number;

  @ManyToOne(() => Promotion, (promotion) => promotion.products, {
    nullable: true,
    // eager: true,
  })
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion;

  @Column({ nullable: true, name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category, (cate) => cate.products, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ nullable: true, name: 'brand_id' })
  brandId: number;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'brand_id' })
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
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => Photo, (image) => image.product, {
    cascade: true,
    eager: true,
  })
  photos: Photo[];

  @Column({ default: 0, name: 'view_count' })
  viewCount: number;

  @Column({ default: 0, name: 'sale_count' })
  saleCount: number;
}
