import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsDateString, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

/**
 * GetTaskFilterDto: Query params para filtrar y buscar tareas.
 * Ejemplo: GET /api/v1/tasks?title=bug&user_email=john@company.com&due_date=2025-12-31
 */
export class GetTaskFilterDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsEmail()
  user_email?: string;
}
