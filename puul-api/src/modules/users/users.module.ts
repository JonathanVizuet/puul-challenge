import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserOrm } from './entities/user.entity';

/**
 * UsersModule: Agrupa controlador, servicio y entidad del módulo de usuarios.
 * Equivalente a registrar un router en FastAPI:
 *   app.include_router(users_router)
 *
 * TypeOrmModule.forFeature([UserOrm]) registra la entidad en este módulo
 * y hace disponible su repositorio para inyectar en el servicio.
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserOrm])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // exportamos por si otros módulos necesitan UsersService
})
export class UsersModule {}
