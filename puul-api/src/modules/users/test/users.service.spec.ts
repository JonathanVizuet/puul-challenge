import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UserOrm, UserRole } from '../entities/user.entity';
import { TaskStatus } from '../../tasks/entities/task.entity';

// ─── Mock del repositorio TypeORM ────────────────────────────────────────────
const mockUserRepository = {
  findOne: jest.fn(),
  findByIds: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

// ─── Datos de prueba reutilizables ──────────────────────────────────────────
const mockUser: UserOrm = {
  id: 'uuid-user-1',
  name: 'John Vizuet',
  email: 'john@puul.com',
  role: UserRole.ADMIN,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  assignments: [],
};

const mockUserWithTasks: UserOrm = {
  ...mockUser,
  assignments: [
    {
      task_id: 'uuid-task-1',
      user_id: 'uuid-user-1',
      assigned_at: new Date(),
      task: {
        id: 'uuid-task-1',
        title: 'Tarea completada',
        status: TaskStatus.COMPLETED,
        cost: 500,
        description: '',
        estimated_hours: 4,
        due_date: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date(),
        assignments: [],
      },
      user: mockUser,
    },
  ],
};

// ─── Helper: mock de QueryBuilder ───────────────────────────────────────────
const buildQueryBuilder = (result: any) => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue(Array.isArray(result) ? result : [result]),
  getOne: jest.fn().mockResolvedValue(result),
});

// ────────────────────────────────────────────────────────────────────────────

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserOrm),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  // ── Scenario: Crear un usuario exitosamente ────────────────────────────
  describe('create()', () => {
    it('should create and return a new user when email is not taken', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const dto = { name: 'John Vizuet', email: 'john@puul.com', role: UserRole.ADMIN };
      const result = await service.create(dto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(result).toEqual(mockUser);
    });

    // ── Scenario: Intentar crear usuario con email duplicado ─────────────
    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const dto = { name: 'Otro', email: 'john@puul.com', role: UserRole.MEMBER };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ── Scenario: Listar usuarios con filtros ──────────────────────────────
  describe('findAll()', () => {
    it('should return users filtered by role', async () => {
      mockUserRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder([mockUser]),
      );

      const result = await service.findAll({ role: UserRole.ADMIN });

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe(UserRole.ADMIN);
    });

    // ── Scenario: Listar usuarios incluye métricas de tareas completadas ──
    it('should include completed_tasks_count and completed_tasks_total_cost', async () => {
      mockUserRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder([mockUserWithTasks]),
      );

      const result = await service.findAll({});

      expect(result[0].completed_tasks_count).toBe(1);
      expect(result[0].completed_tasks_total_cost).toBe(500);
    });
  });

  // ── Scenario: Obtener detalle de un usuario existente ─────────────────
  describe('findOne()', () => {
    it('should return user detail with assigned tasks', async () => {
      mockUserRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(mockUserWithTasks),
      );

      const result = await service.findOne('uuid-user-1');

      expect(result.id).toBe('uuid-user-1');
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Tarea completada');
    });

    // ── Scenario: Buscar usuario que no existe ────────────────────────────
    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(null),
      );

      await expect(service.findOne('uuid-no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── Scenario: Actualizar datos de un usuario ──────────────────────────
  describe('update()', () => {
    it('should update and return the user with new data', async () => {
      const updatedUser = { ...mockUser, name: 'John Actualizado' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('uuid-user-1', { name: 'John Actualizado' });

      expect(result.name).toBe('John Actualizado');
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('uuid-no-existe', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── Scenario: Eliminar un usuario existente ───────────────────────────
  describe('remove()', () => {
    it('should remove user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove('uuid-user-1')).resolves.not.toThrow();
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when removing non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid-no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});