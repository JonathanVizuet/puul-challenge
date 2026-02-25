import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from '../analytics.service';
import { TaskOrm, TaskStatus } from '../../tasks/entities/task.entity';
import { UserOrm, UserRole } from '../../users/entities/user.entity';

// ─── Mocks de repositorios ───────────────────────────────────────────────────
const mockTaskRepository = {
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockUserRepository = {
  createQueryBuilder: jest.fn(),
};

// ─── Datos de prueba ─────────────────────────────────────────────────────────
const mockTaskSummary = [
  { status: TaskStatus.ACTIVE, count: '3', total_cost: '4500', total_estimated_hours: '24' },
  { status: TaskStatus.COMPLETED, count: '2', total_cost: '3000', total_estimated_hours: '16' },
];

const mockUserProductivity = [
  {
    user_id: 'uuid-user-1',
    user_name: 'John Vizuet',
    user_email: 'john@puul.com',
    role: UserRole.MEMBER,
    completed_tasks: '2',
    active_tasks: '1',
    total_cost_completed: '3000',
    total_hours_completed: '16',
  },
];

// ─── Helper: mock de QueryBuilder encadenado ─────────────────────────────────
const buildQueryBuilder = (getRawManyResult: any[], getCountResult?: number) => ({
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue(getRawManyResult),
  getCount: jest.fn().mockResolvedValue(getCountResult ?? 0),
});

// ────────────────────────────────────────────────────────────────────────────

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(TaskOrm), useValue: mockTaskRepository },
        { provide: getRepositoryToken(UserOrm), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    jest.clearAllMocks();
  });

  // ── Scenario: Obtener resumen general de tareas ───────────────────────
  describe('getStats()', () => {
    it('should return task_overview with total tasks and breakdown by status', async () => {
      mockTaskRepository.count.mockResolvedValue(5);
      mockTaskRepository.createQueryBuilder
        .mockReturnValueOnce(buildQueryBuilder(mockTaskSummary))  
        .mockReturnValueOnce(buildQueryBuilder([], 1));           

      mockUserRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(mockUserProductivity),
      );

      const result = await service.getStats();

      expect(result.task_overview.total_tasks).toBe(5);
      expect(result.task_overview.by_status).toHaveLength(2);
      expect(result.task_overview.by_status[0].status).toBe(TaskStatus.ACTIVE);
      expect(result.task_overview.by_status[0].count).toBe(3);
    });

    // ── Scenario: Verificar conteo de tareas vencidas ─────────────────
    it('should return correct overdue_tasks count', async () => {
      mockTaskRepository.count.mockResolvedValue(5);
      mockTaskRepository.createQueryBuilder
        .mockReturnValueOnce(buildQueryBuilder(mockTaskSummary))
        .mockReturnValueOnce(buildQueryBuilder([], 2)); 

      mockUserRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(mockUserProductivity),
      );

      const result = await service.getStats();

      expect(result.task_overview.overdue_tasks).toBe(2);
    });

    // ── Scenario: Obtener productividad por usuario ───────────────────
    it('should return user_productivity with completed tasks, costs and hours', async () => {
      mockTaskRepository.count.mockResolvedValue(5);
      mockTaskRepository.createQueryBuilder
        .mockReturnValueOnce(buildQueryBuilder(mockTaskSummary))
        .mockReturnValueOnce(buildQueryBuilder([], 1));

      mockUserRepository.createQueryBuilder.mockReturnValue(
        buildQueryBuilder(mockUserProductivity),
      );

      const result = await service.getStats();

      expect(result.user_productivity).toHaveLength(1);
      expect(result.user_productivity[0].user_name).toBe('John Vizuet');
      expect(result.user_productivity[0].completed_tasks).toBe(2);
      expect(result.user_productivity[0].total_cost_completed).toBe(3000);
      expect(result.user_productivity[0].total_hours_completed).toBe(16);
    });
  });
});