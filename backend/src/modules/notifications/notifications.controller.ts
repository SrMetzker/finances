import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateFinancialHealthPreferenceDto } from './dto/update-financial-health-preference.dto';
import { PushSubscriptionDto } from './dto/push-subscription.dto';
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

  @Get('push/public-key')
  getPushPublicKey() { return this.service.getPushPublicKey(); }

  @Post('push-subscriptions')
  savePushSubscription(@CurrentUser() user: { sub: string }, @Body() body: PushSubscriptionDto) {
    return this.service.savePushSubscription(user.sub, body);
  }

  @Delete('push-subscriptions')
  deletePushSubscription(@CurrentUser() user: { sub: string }, @Body() body: { endpoint: string }) {
    return this.service.deletePushSubscription(user.sub, body.endpoint);
  }
}
