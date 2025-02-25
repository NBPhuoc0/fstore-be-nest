import { DataSource } from 'typeorm';
import {
  Color,
  User,
  Product,
  Category,
  Brand,
  Size,
  ProductVariant,
  Photo,
  Promotion,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Voucher,
} from '../entities';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
config();

const configService = new ConfigService();

const ORMconfig = new DataSource({
  type: 'postgres',
  // ssl: true,
  url: process.env.DB_URL,
  // host: process.env.DB_HOST,
  // port: parseInt(<string>process.env.DB_PORT) || 5432,
  // username: process.env.DB_USER,
  // password: process.env.DB_PASS,
  // database: process.env.DB_NAME,
  schema: 'fstore',
  entities: [
    Color,
    User,
    Product,
    Category,
    Brand,
    Size,
    ProductVariant,
    Photo,
    Promotion,
    Order,
    OrderItem,
    Cart,
    CartItem,
    Voucher,
  ],
  migrations: ['src/database/migrations/*-migration.ts'],
  migrationsRun: false,
  logging: true,

  // dropSchema: true, //!!
  // synchronize: true,
  // cache: {
  //   type: 'redis',
  //   options: {
  //     socket: {
  //       host: process.env.REDIS_HOST,
  //       port: parseInt(process.env.REDIS_PORT),
  //     },
  //   },
  //   duration: 86400000,
  // },
});
export default ORMconfig;
