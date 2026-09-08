import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateFinancialHealthPreferenceDto } from './dto/update-financial-health-preference.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get('preferences/financial-health')
  getPreference(@CurrentUser() user: { sub: string }) { return this.service.getFinancialHealthPreference(user.sub); }

  @Patch('preferences/financial-health')
  updatePreference(@CurrentUser() user: { sub: string }, @Body() body: UpdateFinancialHealthPreferenceDto) {
    return this.service.updateFinancialHealthPreference(user.sub, body);
  }

  @Get('inbox')
  inbox(@CurrentUser() user: { sub: string }) { return this.service.listInbox(user.sub); }

  @Patch('inbox/:id/read')
  markRead(@CurrentUser() user: { sub: string }, @Param('id') id: string) { return this.service.markRead(user.sub, id); }
}
