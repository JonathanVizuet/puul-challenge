import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserOrm } from './entities/user.entity';

/** DOCUMENTACION:
 * UsersModule: Agrupa controlador, servicio y entidad del módulo de usuarios.
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserOrm])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // exportamos por si otros módulos necesitan UsersService
})
export class UsersModule {}
