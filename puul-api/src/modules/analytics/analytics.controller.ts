import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // DOCUMENTACION: El analytics solo usa get para obtener un analisis
  @Get('stats')
  getStats() {
    return this.analyticsService.getStats();
  }
}
