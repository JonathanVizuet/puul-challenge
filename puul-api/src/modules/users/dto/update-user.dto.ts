import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * UpdateUserDto: Hace todos los campos de CreateUserDto opcionales.
 * Equivalente en Pydantic a:
 *   class UserUpdate(BaseModel):
 *       name: Optional[str] = None
 *       email: Optional[EmailStr] = None
 *       role: Optional[UserRole] = None
 *
 * PartialType de NestJS lo hace automáticamente en una sola línea.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
