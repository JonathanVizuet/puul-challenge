import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { User, CreateUserDto, GetUsersFilter } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(filters?: GetUsersFilter): Observable<User[]> {
    let params = new HttpParams();
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.email) params = params.set('email', filters.email);
    if (filters?.role) params = params.set('role', filters.role);

    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params }).pipe(
      map(r => r.data)
    );
  }

  getById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`).pipe(
      map(r => r.data)
    );
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, dto).pipe(
      map(r => r.data)
    );
  }

  update(id: string, dto: Partial<CreateUserDto>): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}`, dto).pipe(
      map(r => r.data)
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}