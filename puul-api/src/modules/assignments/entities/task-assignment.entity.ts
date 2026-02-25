import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserOrm } from '../../users/entities/user.entity';
import { TaskOrm } from '../../tasks/entities/task.entity';

/** DOCUMENTACION:
 * TaskAssignmentOrm: Tabla intermedia que resuelve la relación M:N entre Users y Tasks
 */
@Entity('task_assignments')
export class TaskAssignmentOrm {
  @PrimaryColumn({ type: 'uuid' })
  task_id: string;

  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  assigned_at: Date;

  // DOCUMENTACION: ManyToOne: muchas asignaciones pertenecen a una tarea
  @ManyToOne(() => TaskOrm, (task) => task.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: TaskOrm;

  // DOCUMENTACION: ManyToOne: muchas asignaciones pertenecen a un usuario
  @ManyToOne(() => UserOrm, (user) => user.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrm;
}
