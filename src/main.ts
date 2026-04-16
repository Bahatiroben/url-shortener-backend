import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Global Response Wrapper
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe())

  // Other configurations (CORS, ValidationPipe, Swagger, etc.)
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  
  await app.listen(3000);
}
bootstrap();
