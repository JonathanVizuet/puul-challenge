import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../core/services/tasks.service';
import { UsersService } from '../../core/services/users.service';
import { Task, CreateTaskDto, GetTasksFilter } from '../../shared/models/task.model';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  users: User[] = [];
  loading = false;
  error = '';
  successMsg = '';

  filters: GetTasksFilter = {};

  showModal = false;
  editingTask: Task | null = null;
  form: CreateTaskDto = { title: '', assigned_user_ids: [] };
  formLoading = false;
  formError = '';

  showDetail = false;
  selectedTask: Task | null = null;

  constructor(
    private tasksService: TasksService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadUsers();
  }

  loadTasks(): void {
    this.loading = true;
    this.tasksService.getAll(this.filters).subscribe({
      next: (data) => { this.tasks = data; this.loading = false; },
      error: () => { this.error = 'Error al cargar tareas'; this.loading = false; }
    });
  }

  loadUsers(): void {
    this.usersService.getAll().subscribe({
      next: (data) => this.users = data
    });
  }

  applyFilters(): void { this.loadTasks(); }
  clearFilters(): void { this.filters = {}; this.loadTasks(); }

  openCreate(): void {
    this.editingTask = null;
    this.form = { title: '', assigned_user_ids: [] };
    this.formError = '';
    this.showModal = true;
  }

  openEdit(task: Task): void {
    this.editingTask = task;
    this.form = {
      title: task.title,
      description: task.description,
      estimated_hours: task.estimated_hours,
      due_date: task.due_date,
      status: task.status,
      cost: task.cost,
      assigned_user_ids: task.assignments.map(a => a.user_id),
    };
    this.formError = '';
    this.showModal = true;
  }

  openDetail(task: Task): void {
    this.tasksService.getById(task.id).subscribe({
      next: (data) => { this.selectedTask = data; this.showDetail = true; },
      error: () => { this.error = 'Error al cargar detalle'; }
    });
  }

  closeModal(): void { this.showModal = false; this.formError = ''; }
  closeDetail(): void { this.showDetail = false; this.selectedTask = null; }

  isUserAssigned(userId: string): boolean {
    return (this.form.assigned_user_ids || []).includes(userId);
  }

  toggleUser(userId: string): void {
    const ids = this.form.assigned_user_ids || [];
    const idx = ids.indexOf(userId);
    if (idx === -1) {
      this.form.assigned_user_ids = [...ids, userId];
    } else {
      this.form.assigned_user_ids = ids.filter(id => id !== userId);
    }
  }

  saveTask(): void {
    this.formLoading = true;
    this.formError = '';

    const action = this.editingTask
      ? this.tasksService.update(this.editingTask.id, this.form)
      : this.tasksService.create(this.form);

    action.subscribe({
      next: () => {
        this.showModal = false;
        this.formLoading = false;
        this.successMsg = this.editingTask ? 'Tarea actualizada' : 'Tarea creada';
        setTimeout(() => this.successMsg = '', 3000);
        this.loadTasks();
      },
      error: (err) => {
        this.formError = err.error?.message?.[0] || 'Error al guardar';
        this.formLoading = false;
      }
    });
  }

  deleteTask(task: Task): void {
    if (!confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
    this.tasksService.delete(task.id).subscribe({
      next: () => {
        this.successMsg = 'Tarea eliminada';
        setTimeout(() => this.successMsg = '', 3000);
        this.loadTasks();
      },
      error: () => { this.error = 'Error al eliminar tarea'; }
    });
  }

  toggleStatus(task: Task): void {
    const newStatus = task.status === 'active' ? 'completed' : 'active';
    this.tasksService.update(task.id, { status: newStatus }).subscribe({
      next: () => this.loadTasks(),
      error: () => { this.error = 'Error al actualizar estado'; }
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
  }
}