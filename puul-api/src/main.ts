import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // DOCUMENTACION: Global prefix: todas las rutas serán /api/v1/...
  app.setGlobalPrefix('api/v1');

  // ValidationPipe: equivalente al "validator" de Pydantic en FastAPI
  // Valida automáticamente todos los DTOs y rechaza campos desconocidos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // elimina campos que no están en el DTO
      forbidNonWhitelisted: false,
      transform: true,       // convierte strings a tipos correctos (ej: "123" -> 123)
    }),
  );

  // Filtro global de errores: da formato estándar a todos los errores
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor global: da formato estándar a todas las respuestas exitosas
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Puul API running on: http://localhost:${port}/api/v1`);
}

bootstrap();
