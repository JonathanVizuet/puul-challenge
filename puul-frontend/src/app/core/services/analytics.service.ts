import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Analytics } from '../../shared/models/task.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<Analytics> {
    return this.http.get<ApiResponse<Analytics>>(`${this.apiUrl}/stats`).pipe(
      map(r => r.data)
    );
  }
}