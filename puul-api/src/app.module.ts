import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // ConfigModule: equivalente a python-dotenv, carga variables de .env globalmente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM: equivalente a SQLAlchemy en FastAPI / Django ORM
    // Conecta con PostgreSQL usando las variables del .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        // Entidades: equivalente a los "models" en Django/SQLAlchemy
        // autoLoadEntities carga automáticamente todas las entidades registradas en los módulos
        autoLoadEntities: true,
        // synchronize: en desarrollo TypeORM crea/actualiza las tablas automáticamente
        // ⚠️ NUNCA usar en producción, usar migraciones
        synchronize: true,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    UsersModule,
    TasksModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
