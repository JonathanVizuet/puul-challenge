import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_hours?: number;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  // Array de UUIDs de usuarios a asignar
  // Equivalente a: assigned_user_ids: Optional[List[UUID]] = []
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true }) // valida cada elemento del array como UUID
  assigned_user_ids?: string[];
}
