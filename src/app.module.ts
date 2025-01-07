import { INestApplication, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Color,
  User,
  Product,
  Category,
  Brand,
  Size,
  ProductColor,
  ProductVariant,
  Photo,
  Promotion,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Voucher,
} from './entities';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { CommonModule } from './common/common.module';
import { PromotionModule } from './promotion/promotion.module';
import { dynamicImport } from './common/helper';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
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
        ProductColor,
        ProductVariant,
        Photo,
        Promotion,
        Order,
        OrderItem,
        Cart,
        CartItem,
        Voucher,
      ],
      autoLoadEntities: true,
      // dropSchema: true, //!!
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    OrderModule,
    ProductModule,
    CommonModule,
    PromotionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static port: number | string;

  constructor(configService: ConfigService) {
    AppModule.port = configService.get<string>('PORT') || 8080;
  }

  static getBaseUrl(app: INestApplication): string {
    let baseUrl = app.getHttpServer().address().address;
    if (baseUrl == '0.0.0.0' || baseUrl == '::') {
      baseUrl = 'localhost';
    }
    return baseUrl;
  }
}
