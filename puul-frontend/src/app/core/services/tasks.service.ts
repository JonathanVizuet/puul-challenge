import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Task, CreateTaskDto, GetTasksFilter } from '../../shared/models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(filters?: GetTasksFilter): Observable<Task[]> {
    let params = new HttpParams();
    if (filters?.title) params = params.set('title', filters.title);
    if (filters?.due_date) params = params.set('due_date', filters.due_date);
    if (filters?.user_id) params = params.set('user_id', filters.user_id);
    if (filters?.user_name) params = params.set('user_name', filters.user_name);
    if (filters?.user_email) params = params.set('user_email', filters.user_email);

    return this.http.get<ApiResponse<Task[]>>(this.apiUrl, { params }).pipe(
      map(r => r.data)
    );
  }

  getById(id: string): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`).pipe(
      map(r => r.data)
    );
  }

  create(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(this.apiUrl, dto).pipe(
      map(r => r.data)
    );
  }

  update(id: string, dto: Partial<CreateTaskDto>): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${id}`, dto).pipe(
      map(r => r.data)
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}