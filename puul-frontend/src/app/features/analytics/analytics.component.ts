import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Analytics } from '../../shared/models/task.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent implements OnInit {
  stats: Analytics | null = null;
  loading = false;
  error = '';

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loading = true;
    this.analyticsService.getStats().subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: () => { this.error = 'Error al cargar estadísticas'; this.loading = false; }
    });
  }

  getCompletionRate(): number {
    if (!this.stats || this.stats.task_overview.total_tasks === 0) return 0;
    const completed = this.stats.task_overview.by_status
      .find(s => s.status === 'completed')?.count || 0;
    return Math.round((completed / this.stats.task_overview.total_tasks) * 100);
  }

  getTotalCost(): number {
    if (!this.stats) return 0;
    return this.stats.task_overview.by_status
      .reduce((sum, s) => sum + s.total_cost, 0);
  }

  getTotalHours(): number {
    if (!this.stats) return 0;
    return this.stats.task_overview.by_status
      .reduce((sum, s) => sum + s.total_estimated_hours, 0);
  }
}