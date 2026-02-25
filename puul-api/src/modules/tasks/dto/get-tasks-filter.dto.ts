import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsDateString, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

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
