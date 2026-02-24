import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TaskOrm } from '../tasks/entities/task.entity';
import { UserOrm } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskOrm, UserOrm])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
