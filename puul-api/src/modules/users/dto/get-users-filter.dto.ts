import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

/** DOCUMENTACION:
 * GetUsersFilterDto: Define los query params opcionales para filtrar usuarios.
 * Ejemplo de uso: GET /api/v1/users?name=John&role=admin
 */
export class GetUsersFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
