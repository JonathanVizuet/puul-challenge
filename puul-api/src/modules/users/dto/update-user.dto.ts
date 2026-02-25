import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/** DOCUMENTACION:
 * UpdateUserDto: Hace todos los campos de CreateUserDto opcionales.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
