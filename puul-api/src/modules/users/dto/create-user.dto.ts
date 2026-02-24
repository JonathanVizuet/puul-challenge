import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

/**
 * CreateUserDto: Define y valida los datos para crear un usuario.
 * Equivalente a un Schema de Pydantic en FastAPI:
 *   class UserCreate(BaseModel):
 *       name: str
 *       email: EmailStr
 *       role: UserRole
 *
 * Los decoradores como @IsEmail() son los "validators" de class-validator.
 * NestJS los ejecuta automáticamente gracias al ValidationPipe global en main.ts.
 */
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
