export type TaskStatus = 'active' | 'completed';

export interface AssignedUser {
  user_id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assigned_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimated_hours?: number;
  due_date?: string;
  status: TaskStatus;
  cost?: number;
  created_at: string;
  updated_at: string;
  assignments: AssignedUser[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  estimated_hours?: number;
  due_date?: string;
  status?: TaskStatus;
  cost?: number;
  assigned_user_ids?: string[];
}

export interface GetTasksFilter {
  title?: string;
  due_date?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
}

export interface Analytics {
  task_overview: {
    total_tasks: number;
    overdue_tasks: number;
    by_status: { status: string; count: number; total_cost: number; total_estimated_hours: number }[];
  };
  user_productivity: {
    user_id: string;
    user_name: string;
    user_email: string;
    role: string;
    completed_tasks: number;
    active_tasks: number;
    total_cost_completed: number;
    total_hours_completed: number;
  }[];
}