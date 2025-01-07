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
} from 'typeorm';
import { Promotion } from './promotion.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { Size } from './size.entity';
import { ProductColor } from './product-color.entity';
import { ProductVariant } from './product-variant.entity';
import { Photo } from './photo.entity';

@Entity('products')
@Index('idx_unique_code', ['code'], { unique: true })
@Index('idx_unique_url_handle', ['urlHandle'], { unique: true })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: false })
  urlHandle: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  metaDesc: string;

  @Column({ default: true })
  display: boolean;

  @Column({ default: true })
  inventoryStatus: boolean;

  @Column({ nullable: false, type: 'float' })
  originalPrice: number;

  @Column({ nullable: true, type: 'float' })
  salePrice: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(() => Promotion, (promotion) => promotion.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, { nullable: false })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToMany(() => Size)
  @JoinTable({
    name: 'product_size',
    joinColumns: [{ name: 'product_id' }],
    inverseJoinColumns: [{ name: 'size_id' }],
  })
  sizes: Size[];

  @OneToMany(() => ProductColor, (productColor) => productColor.product)
  colors: ProductColor[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => Photo, (image) => image.product)
  images: Photo[];
}
