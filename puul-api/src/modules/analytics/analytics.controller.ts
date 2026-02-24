import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // GET /api/v1/analytics/stats
  @Get('stats')
  getStats() {
    return this.analyticsService.getStats();
  }
}
