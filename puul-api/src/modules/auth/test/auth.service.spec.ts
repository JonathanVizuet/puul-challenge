import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/entities/user.entity';

// ─── Mocks ──────────────────────────────────────────────────────────────────
const mockUsersService = {
  findAll: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

// ─── Datos de prueba ─────────────────────────────────────────────────────────
const mockUser = {
  id: 'uuid-user-1',
  name: 'John Vizuet',
  email: 'john@puul.com',
  role: UserRole.ADMIN,
  completed_tasks_count: 0,
  completed_tasks_total_cost: 0,
};

// ────────────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── Scenario: Login exitoso con email registrado ───────────────────────
  describe('login()', () => {
    it('should return access_token and user data when email exists', async () => {
      const fakeToken = 'jwt.token.firmado';
      mockUsersService.findAll.mockResolvedValue([mockUser]);
      mockJwtService.sign.mockReturnValue(fakeToken);

      const result = await service.login({ email: 'john@puul.com' });

      expect(result.access_token).toBe(fakeToken);
      expect(result.token_type).toBe('Bearer');
      expect(result.user.email).toBe('john@puul.com');
      expect(result.user.role).toBe(UserRole.ADMIN);
    });

    // ── Scenario: Token contiene información correcta del usuario ─────────
    it('should sign token with correct payload including sub, name, email and role', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);
      mockJwtService.sign.mockReturnValue('token');

      await service.login({ email: 'john@puul.com' });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    // ── Scenario: Login fallido con email no registrado ───────────────────
    it('should throw UnauthorizedException when email does not exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      await expect(
        service.login({ email: 'fantasma@puul.com' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});