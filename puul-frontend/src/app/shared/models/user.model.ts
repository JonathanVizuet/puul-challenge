export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  completed_tasks_count?: number;
  completed_tasks_total_cost?: number;
  tasks?: UserTask[];
}

export interface UserTask {
  id: string;
  title: string;
  status: string;
  due_date: string;
  cost: number;
  assigned_at: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
}

export interface GetUsersFilter {
  name?: string;
  email?: string;
  role?: UserRole;
}