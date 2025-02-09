import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  Tree,
  TreeParent,
  TreeChildren,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { Product } from './product.entity';
import slugify from 'slugify';

@Entity('product_categories')
// @Tree('materialized-path')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  urlHandle: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  children: Category[];

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    this.urlHandle = slugify(this.name);
  }
}
