import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './common/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TypeORMExceptionFilter } from './common/filters/typeorm-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Allow all origins, you can specify a specific origin if needed
    // allowedHeaders: ['Content-Type'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true, // <- This line here
      },
      validationError: {
        target: true,
        value: true,
      },
    }),
  );
  // app.use(cookieParser());

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new TypeORMExceptionFilter());
  const logger = new Logger('Main');

  setupSwagger(app);

  await app.listen(AppModule.port);

  // log docs
  const baseUrl = AppModule.getBaseUrl(app);
  const url = `http://${baseUrl}:${AppModule.port}`;
  logger.log(`API Documentation available at ${url}`);
}
bootstrap();
