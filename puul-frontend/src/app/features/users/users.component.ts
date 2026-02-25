import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { User, CreateUserDto, GetUsersFilter } from '../../shared/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  successMsg = '';

  filters: GetUsersFilter = {};

  // Modal de crear y/o editar
  showModal = false;
  editingUser: User | null = null;
  form: CreateUserDto = { name: '', email: '', role: 'member' };
  formLoading = false;
  formError = '';

  // Modal de detalle
  showDetail = false;
  selectedUser: User | null = null;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.usersService.getAll(this.filters).subscribe({
      next: (data) => { this.users = data; this.loading = false; },
      error: () => { this.error = 'Error al cargar usuarios'; this.loading = false; }
    });
  }

  applyFilters(): void { this.loadUsers(); }

  clearFilters(): void {
    this.filters = {};
    this.loadUsers();
  }

  openCreate(): void {
    this.editingUser = null;
    this.form = { name: '', email: '', role: 'member' };
    this.formError = '';
    this.showModal = true;
  }

  openEdit(user: User): void {
    this.editingUser = user;
    this.form = { name: user.name, email: user.email, role: user.role };
    this.formError = '';
    this.showModal = true;
  }

  openDetail(user: User): void {
    this.loading = true;
    this.usersService.getById(user.id).subscribe({
      next: (data) => { this.selectedUser = data; this.showDetail = true; this.loading = false; },
      error: () => { this.error = 'Error al cargar detalle'; this.loading = false; }
    });
  }

  closeModal(): void { this.showModal = false; this.formError = ''; }
  closeDetail(): void { this.showDetail = false; this.selectedUser = null; }

  saveUser(): void {
    this.formLoading = true;
    this.formError = '';

    const action = this.editingUser
      ? this.usersService.update(this.editingUser.id, this.form)
      : this.usersService.create(this.form);

    action.subscribe({
      next: () => {
        this.showModal = false;
        this.formLoading = false;
        this.successMsg = this.editingUser ? 'Usuario actualizado' : 'Usuario creado';
        setTimeout(() => this.successMsg = '', 3000);
        this.loadUsers();
      },
      error: (err) => {
        this.formError = err.error?.message?.[0] || 'Error al guardar';
        this.formLoading = false;
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`¿Eliminar a ${user.name}?`)) return;
    this.usersService.delete(user.id).subscribe({
      next: () => {
        this.successMsg = 'Usuario eliminado';
        setTimeout(() => this.successMsg = '', 3000);
        this.loadUsers();
      },
      error: () => { this.error = 'Error al eliminar usuario'; }
    });
  }

  getRoleBadge(role: string): string {
    return role === 'admin' ? 'badge-admin' : 'badge-member';
  }
}