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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, GetTaskFilterDto } from './dto/task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // DOCUMENTACION: POST /api/v1/tasks
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  // GET /api/v1/tasks?title=bug&user_email=john@co.com&due_date=2025-12-31
  @Get()
  findAll(@Query() filters: GetTaskFilterDto) {
    return this.tasksService.findAll(filters);
  }

  // GET /api/v1/tasks/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // PATCH /api/v1/tasks/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  // DELETE /api/v1/tasks/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id).then(() => ({
      message: 'Tarea eliminada correctamente',
    }));
  }
}
