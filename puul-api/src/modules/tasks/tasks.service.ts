import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskOrm } from './entities/task.entity';
import { TaskAssignmentOrm } from '../assignments/entities/task-assignment.entity';
import { UserOrm } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, GetTaskFilterDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskOrm)
    private readonly taskRepository: Repository<TaskOrm>,

    @InjectRepository(TaskAssignmentOrm)
    private readonly assignmentRepository: Repository<TaskAssignmentOrm>,

    @InjectRepository(UserOrm)
    private readonly userRepository: Repository<UserOrm>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskOrm> {
    const { assigned_user_ids = [], ...taskData } = createTaskDto;

    // Validar que todos los usuarios existen antes de crear la tarea
    if (assigned_user_ids.length > 0) {
      const users = await this.userRepository.findByIds(assigned_user_ids);
      if (users.length !== assigned_user_ids.length) {
        throw new BadRequestException('Uno o más usuarios no fueron encontrados');
      }
    }

    // Crear la tarea
    const task = this.taskRepository.create(taskData);
    const savedTask = await this.taskRepository.save(task);

    // Crear las asignaciones en la tabla intermedia
    if (assigned_user_ids.length > 0) {
      const assignments = assigned_user_ids.map((userId) =>
        this.assignmentRepository.create({
          task_id: savedTask.id,
          user_id: userId,
        }),
      );
      await this.assignmentRepository.save(assignments);
    }

    // Retornar la tarea con las asignaciones cargadas
    return this.findOne(savedTask.id);
  }

  async findAll(filters: GetTaskFilterDto): Promise<TaskOrm[]> {
    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignments', 'assignment')
      .leftJoinAndSelect('assignment.user', 'user')
      // Ordenar de más reciente a menos reciente (como especifica la arquitectura)
      .orderBy('task.created_at', 'DESC');

    if (filters.title) {
      qb.andWhere('task.title ILIKE :title', { title: `%${filters.title}%` });
    }

    if (filters.due_date) {
      qb.andWhere('task.due_date = :due_date', { due_date: filters.due_date });
    }

    // Filtros por usuario: por id, nombre o correo
    if (filters.user_id) {
      qb.andWhere('assignment.user_id = :user_id', { user_id: filters.user_id });
    }

    if (filters.user_name) {
      qb.andWhere('user.name ILIKE :user_name', {
        user_name: `%${filters.user_name}%`,
      });
    }

    if (filters.user_email) {
      qb.andWhere('user.email ILIKE :user_email', {
        user_email: `%${filters.user_email}%`,
      });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<TaskOrm> {
    const task = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignments', 'assignment')
      .leftJoinAndSelect('assignment.user', 'user')
      .where('task.id = :id', { id })
      .getOne();

    if (!task) {
      throw new NotFoundException(`Tarea con id ${id} no encontrada`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskOrm> {
    const task = await this.findOne(id);
    const { assigned_user_ids, ...taskData } = updateTaskDto;

    // Actualizar campos de la tarea
    Object.assign(task, taskData);
    await this.taskRepository.save(task);

    // Si se mandan nuevos usuarios, reasignar completamente
    if (assigned_user_ids !== undefined) {
      // Validar que los usuarios existen
      if (assigned_user_ids.length > 0) {
        const users = await this.userRepository.findByIds(assigned_user_ids);
        if (users.length !== assigned_user_ids.length) {
          throw new BadRequestException('Uno o más usuarios no fueron encontrados');
        }
      }

      // Eliminar asignaciones anteriores y crear las nuevas
      await this.assignmentRepository.delete({ task_id: id });

      if (assigned_user_ids.length > 0) {
        const newAssignments = assigned_user_ids.map((userId) =>
          this.assignmentRepository.create({ task_id: id, user_id: userId }),
        );
        await this.assignmentRepository.save(newAssignments);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Tarea con id ${id} no encontrada`);
    }
    await this.taskRepository.remove(task);
  }
}
