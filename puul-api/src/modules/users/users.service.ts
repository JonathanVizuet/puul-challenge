import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrm } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';

/** DOCUMENTACION:
 * UsersService: Contiene toda la lógica de negocio de usuarios.
 */
@Injectable()
export class UsersService {
  constructor(
    // InjectRepository: inyecta el repositorio de TypeORM para UserOrm
    // Equivalente a: db: Session = Depends(get_db) en FastAPI
    @InjectRepository(UserOrm)
    private readonly userRepository: Repository<UserOrm>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserOrm> {
    // Verificar que el email no esté duplicado
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException(`El email ${createUserDto.email} ya está registrado`);
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(filters: GetUsersFilterDto): Promise<any[]> {
    /**
     * QueryBuilder: constructor de queries SQL.
     * Equivalente a SQLAlchemy:
     *   query = db.query(User)
     *   if name: query = query.filter(User.name.ilike(f"%{name}%"))
     */
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.assignments', 'assignment')
      .leftJoinAndSelect('assignment.task', 'task');

    if (filters.name) {
      // ILIKE = case-insensitive LIKE, equivalente a .ilike() en SQLAlchemy
      qb.andWhere('user.name ILIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.email) {
      qb.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` });
    }
    if (filters.role) {
      qb.andWhere('user.role = :role', { role: filters.role });
    }

    const users = await qb.getMany();

    // Enriquece cada usuario con sus estadísticas de tareas terminadas
    return users.map((user) => {
      const completedTasks = (user.assignments || [])
        .map((a) => a.task)
        .filter((t) => t && t.status === 'completed');

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
        completed_tasks_count: completedTasks.length,
        completed_tasks_total_cost: completedTasks.reduce(
          (sum, t) => sum + Number(t.cost || 0),
          0,
        ),
      };
    });
  }

  async findOne(id: string): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.assignments', 'assignment')
      .leftJoinAndSelect('assignment.task', 'task')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const completedTasks = (user.assignments || [])
      .map((a) => a.task)
      .filter((t) => t && t.status === 'completed');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
      completed_tasks_count: completedTasks.length,
      completed_tasks_total_cost: completedTasks.reduce(
        (sum, t) => sum + Number(t.cost || 0),
        0,
      ),
      tasks: (user.assignments || []).map((a) => ({
        id: a.task?.id,
        title: a.task?.title,
        status: a.task?.status,
        due_date: a.task?.due_date,
        cost: a.task?.cost,
        assigned_at: a.assigned_at,
      })),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserOrm> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Si cambia el email, verificar que no esté duplicado
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing) {
        throw new ConflictException(`El email ${updateUserDto.email} ya está registrado`);
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    await this.userRepository.remove(user);
  }
}
