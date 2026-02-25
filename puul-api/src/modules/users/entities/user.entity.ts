import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TaskAssignmentOrm } from '../../assignments/entities/task-assignment.entity';

/** DOCUMENTACION:
 * UserOrm: Entidad que mapea la tabla "users" de PostgreSQL.
 */
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('users')
export class UserOrm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  // type: 'enum' mapea directamente al tipo ENUM de PostgreSQL
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Relación: un usuario puede tener muchas asignaciones (tabla intermedia)
  // Equivalente a: relacionado con Task via ManyToMany a través de task_assignments
  @OneToMany(() => TaskAssignmentOrm, (assignment) => assignment.user)
  assignments: TaskAssignmentOrm[];
}
