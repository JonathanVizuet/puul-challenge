import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskOrm } from './entities/task.entity';
import { TaskAssignmentOrm } from '../assignments/entities/task-assignment.entity';
import { UserOrm } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskOrm, TaskAssignmentOrm, UserOrm]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
