import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TasksService } from '../tasks.service';
import { TaskOrm, TaskStatus } from '../entities/task.entity';
import { TaskAssignmentOrm } from '../../assignments/entities/task-assignment.entity';
import { UserOrm, UserRole } from '../../users/entities/user.entity';

// ─── Mocks de repositorios ───────────────────────────────────────────────────
const mockTaskRepository = {
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockAssignmentRepository = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockUserRepository = {
  findByIds: jest.fn(),
};

// ─── Datos de prueba ─────────────────────────────────────────────────────────
const mockUser: UserOrm = {
  id: 'uuid-user-1',
  name: 'John Vizuet',
  email: 'john@puul.com',
  role: UserRole.MEMBER,
  created_at: new Date(),
  updated_at: new Date(),
  assignments: [],
};

const mockTask: TaskOrm = {
  id: 'uuid-task-1',
  title: 'Diseñar base de datos',
  description: 'Crear el ERD del proyecto',
  estimated_hours: 8,
  due_date: '2024-12-31',
  status: TaskStatus.ACTIVE,
  cost: 1500,
  created_at: new Date(),
  updated_at: new Date(),
  assignments: [],
};

const mockTaskWithAssignments: TaskOrm = {
  ...mockTask,
  assignments: [
    {
      task_id: 'uuid-task-1',
      user_id: 'uuid-user-1',
      assigned_at: new Date(),
      task: mockTask,
      user: mockUser,
    },
  ],
};

// ─── Helper: mock de QueryBuilder ────────────────────────────────────────────
const buildQueryBuilder = (result: any) => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue(Array.isArray(result) ? result : [result]),
  getOne: jest.fn().mockResolvedValue(result),
});

// ────────────────────────────────────────────────────────────────────────────

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(TaskOrm), useValue: mockTaskRepository },
        { provide: getRepositoryToken(TaskAssignmentOrm), useValue: mockAssignmentRepository },
        { provide: getRepositoryToken(UserOrm), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  // ── Scenario: Crear tarea y asignarla a usuarios existentes ──────────
  describe('create()', () => {
    it('should create a task and assign valid users', async () => {
      mockUserRepository.findByIds.mockResolvedValue([mockUser]);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);
      mockAssignmentRepository.create.mockReturnValue({});
      mockAssignmentRepository.save.mockResolvedValue([]);
      mockTaskRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(mockTaskWithAssignments),
      );

      const dto = {
        title: 'Diseñar base de datos',
        estimated_hours: 8,
        assigned_user_ids: ['uuid-user-1'],
      };

      const result = await service.create(dto);

      expect(result.assignments).toHaveLength(1);
      expect(mockAssignmentRepository.save).toHaveBeenCalled();
    });

    // ── Scenario: Crear tarea con usuarios inexistentes ───────────────
    it('should throw BadRequestException when user ids do not exist', async () => {
      mockUserRepository.findByIds.mockResolvedValue([]); // ninguno encontrado

      await expect(
        service.create({
          title: 'Tarea inválida',
          assigned_user_ids: ['uuid-no-existe'],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── Scenario: Listar tareas con múltiples filtros ─────────────────
  describe('findAll()', () => {
    it('should return tasks ordered by created_at DESC', async () => {
      mockTaskRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder([mockTask]),
      );

      const result = await service.findAll({});

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Diseñar base de datos');
    });

    // ── Scenario: Filtrar tareas por nombre de usuario asignado ──────
    it('should apply user_name filter when provided', async () => {
      const qb = buildQueryBuilder([mockTaskWithAssignments]);
      mockTaskRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ user_name: 'John' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.name ILIKE :user_name',
        { user_name: '%John%' },
      );
    });
  });

  // ── Scenario: Obtener detalle de tarea existente ──────────────────
  describe('findOne()', () => {
    it('should return task with assignments when found', async () => {
      mockTaskRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(mockTaskWithAssignments),
      );

      const result = await service.findOne('uuid-task-1');

      expect(result.id).toBe('uuid-task-1');
      expect(result.assignments).toHaveLength(1);
    });

    // ── Scenario: Buscar tarea que no existe ─────────────────────────
    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(null),
      );

      await expect(service.findOne('uuid-no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── Scenario: Completar una tarea cambiando su estado ────────────
  describe('update()', () => {
    it('should update task status to completed', async () => {
      const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };
      mockTaskRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(mockTask),
      );
      mockTaskRepository.save.mockResolvedValue(completedTask);

      // Segunda llamada a findOne (después del save) devuelve la tarea completada
      mockTaskRepository.createQueryBuilder
        .mockReturnValueOnce(buildQueryBuilder(mockTask))
        .mockReturnValueOnce(buildQueryBuilder(completedTask));

      const result = await service.update('uuid-task-1', {
        status: TaskStatus.COMPLETED,
      });

      expect(result.status).toBe(TaskStatus.COMPLETED);
    });

    // ── Scenario: Reasignar usuarios en una tarea ─────────────────
    it('should replace assigned users when assigned_user_ids is provided', async () => {
      mockTaskRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(mockTask),
      );
      mockTaskRepository.save.mockResolvedValue(mockTask);
      mockUserRepository.findByIds.mockResolvedValue([mockUser]);
      mockAssignmentRepository.delete.mockResolvedValue({});
      mockAssignmentRepository.create.mockReturnValue({});
      mockAssignmentRepository.save.mockResolvedValue([]);

      mockTaskRepository.createQueryBuilder
        .mockReturnValueOnce(buildQueryBuilder(mockTask))
        .mockReturnValueOnce(buildQueryBuilder(mockTaskWithAssignments));

      await service.update('uuid-task-1', {
        assigned_user_ids: ['uuid-user-1'],
      });

      expect(mockAssignmentRepository.delete).toHaveBeenCalledWith({
        task_id: 'uuid-task-1',
      });
      expect(mockAssignmentRepository.save).toHaveBeenCalled();
    });
  });

  // ── Scenario: Eliminar una tarea existente ────────────────────────
  describe('remove()', () => {
    it('should remove task successfully', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove('uuid-task-1')).resolves.not.toThrow();
      expect(mockTaskRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    // ── Scenario: Eliminar tarea que no existe ────────────────────
    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid-no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});