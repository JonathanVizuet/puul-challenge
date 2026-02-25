import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TaskAssignmentOrm } from '../../assignments/entities/task-assignment.entity';

export enum TaskStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('tasks')
export class TaskOrm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'numeric', nullable: true })
  estimated_hours: number;

  @Column({ type: 'date', nullable: true })
  due_date: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.ACTIVE,
  })
  status: TaskStatus;

  @Column({ type: 'numeric', nullable: true })
  cost: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // DOCUMENTACION: Relación con la tabla intermedia task_assignments
  @OneToMany(() => TaskAssignmentOrm, (assignment) => assignment.task, {
    cascade: true, // si se elimina la tarea, se eliminan las asignaciones
    eager: true,   // carga las asignaciones automáticamente al consultar una tarea
  })
  assignments: TaskAssignmentOrm[];
}
