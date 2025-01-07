import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity('colors')
export class Color extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  color: string;

  @OneToMany(() => Color, (color) => color.parent)
  parent: Color;

  @ManyToOne(() => Color, (color) => color.parent)
  children: Color[];
}
