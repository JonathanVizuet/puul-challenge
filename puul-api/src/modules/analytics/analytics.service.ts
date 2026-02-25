import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskOrm, TaskStatus } from '../tasks/entities/task.entity';
import { UserOrm } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(TaskOrm)
    private readonly taskRepository: Repository<TaskOrm>,

    @InjectRepository(UserOrm)
    private readonly userRepository: Repository<UserOrm>,
  ) {}

  async getStats(): Promise<any> {
    const taskSummary = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .addSelect('SUM(task.cost)', 'total_cost')
      .addSelect('SUM(task.estimated_hours)', 'total_estimated_hours')
      .groupBy('task.status')
      .getRawMany();

    const totalTasks = await this.taskRepository.count();
    const overdueTasks = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.due_date < CURRENT_DATE')
      .andWhere('task.status != :status', { status: TaskStatus.COMPLETED })
      .getCount();

    const userProductivity = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.assignments', 'assignment')
      .leftJoin('assignment.task', 'task')
      .select('user.id', 'user_id')
      .addSelect('user.name', 'user_name')
      .addSelect('user.email', 'user_email')
      .addSelect('user.role', 'role')
      .addSelect(
        `COUNT(CASE WHEN task.status = 'completed' THEN 1 END)`,
        'completed_tasks',
      )
      .addSelect(
        `COUNT(CASE WHEN task.status = 'active' THEN 1 END)`,
        'active_tasks',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN task.status = 'completed' THEN task.cost ELSE 0 END), 0)`,
        'total_cost_completed',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN task.status = 'completed' THEN task.estimated_hours ELSE 0 END), 0)`,
        'total_hours_completed',
      )
      .groupBy('user.id')
      .orderBy('completed_tasks', 'DESC')
      .getRawMany();

    return {
      task_overview: {
        total_tasks: totalTasks,
        overdue_tasks: overdueTasks,
        by_status: taskSummary.map((s) => ({
          status: s.status,
          count: Number(s.count),
          total_cost: Number(s.total_cost || 0),
          total_estimated_hours: Number(s.total_estimated_hours || 0),
        })),
      },
      user_productivity: userProductivity.map((u) => ({
        user_id: u.user_id,
        user_name: u.user_name,
        user_email: u.user_email,
        role: u.role,
        completed_tasks: Number(u.completed_tasks),
        active_tasks: Number(u.active_tasks),
        total_cost_completed: Number(u.total_cost_completed),
        total_hours_completed: Number(u.total_hours_completed),
      })),
    };
  }
}
