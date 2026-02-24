import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';

/**
 * UsersController: Define las rutas HTTP del módulo de usuarios.
 * Equivalente a un APIRouter de FastAPI:
 *   router = APIRouter(prefix="/users")
 *
 * @Controller('users') + prefijo global 'api/v1' = /api/v1/users
 *
 * El controlador SOLO recibe y devuelve datos.
 * La lógica de negocio vive en UsersService.
 */
@Controller('users')
export class UsersController {
  // Inyección de dependencias: NestJS inyecta UsersService automáticamente
  // Equivalente a: service: UsersService = Depends(get_users_service)
  constructor(private readonly usersService: UsersService) {}

  // POST /api/v1/users
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /api/v1/users?name=John&role=admin
  // @Query() captura los query parameters, equivalente a Query() en FastAPI
  @Get()
  findAll(@Query() filters: GetUsersFilterDto) {
    return this.usersService.findAll(filters);
  }

  // GET /api/v1/users/:id
  // @Param('id') captura el path parameter, equivalente a Path() en FastAPI
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // PATCH /api/v1/users/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE /api/v1/users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id).then(() => ({
      message: 'Usuario eliminado correctamente',
    }));
  }
}
