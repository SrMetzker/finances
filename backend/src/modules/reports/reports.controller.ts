import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from '../../common/guards/workspace-access.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private parseCsvIds(raw?: string) {
    if (!raw) {
      return [];
    }

    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  @Get('monthly')
  monthly(
    @WorkspaceId() wid: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.reportsService.monthly(wid, Number(month), Number(year));
  }

  @Get('dashboard')
  dashboard(
    @WorkspaceId() wid: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.reportsService.dashboard(wid, Number(month), Number(year));
  }

  @Get('analytics')
  analytics(
    @WorkspaceId() wid: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('accountIds') accountIds?: string,
    @Query('categoryIds') categoryIds?: string,
  ) {
    return this.reportsService.analytics(
      wid,
      Number(month),
      Number(year),
      this.parseCsvIds(accountIds),
      this.parseCsvIds(categoryIds),
    );
  }
}
