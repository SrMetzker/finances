import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NotificationPreference } from '@prisma/client';
import webpush from 'web-push';
import { NotificationsRepository } from './notifications.repository';
import { UpdateFinancialHealthPreferenceDto } from './dto/update-financial-health-preference.dto';
import { PushSubscriptionDto } from './dto/push-subscription.dto';

type LocalClock = { year: number; month: number; day: number; weekday: number; minutes: number };

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private dispatchTimer?: ReturnType<typeof setInterval>;
  private readonly logger = new Logger(NotificationsService.name);
  private readonly pushEnabled: boolean;

  constructor(private readonly repository: NotificationsRepository, config: ConfigService) {
    const publicKey = config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = config.get<string>('VAPID_PRIVATE_KEY');
    const subject = config.get<string>('VAPID_SUBJECT');
    this.pushEnabled = Boolean(publicKey && privateKey && subject);
    if (this.pushEnabled) webpush.setVapidDetails(subject!, publicKey!, privateKey!);
  }

  onModuleInit() {
    // The delivery rule stays in this service, so a queue/cron can replace this
    // lightweight runner without changing controllers or preference storage.
    this.dispatchTimer = setInterval(() => {
      void this.dispatchDueNotifications().catch(() => {
        // The next interval retries; failures must not bring down the API.
      });
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.dispatchTimer) clearInterval(this.dispatchTimer);
  }

  async getFinancialHealthPreference(userId: string) {
    const preference = await this.repository.getFinancialHealthPreference(userId);
    return preference ? this.toPreferenceResponse(preference) : {
      enabled: false, frequency: 'WEEKLY', weekday: 1, dayOfMonth: 1, time: '09:00', timezone: 'Europe/Madrid',
    };
  }

  async updateFinancialHealthPreference(userId: string, dto: UpdateFinancialHealthPreferenceDto) {
    const current = await this.repository.getFinancialHealthPreference(userId);
    const resetLastSentAt = !current
      || (!current.enabled && dto.enabled)
      || String(current.frequency) !== dto.frequency
      || current.weekday !== (dto.weekday ?? 1)
      || current.dayOfMonth !== (dto.dayOfMonth ?? 1)
      || current.time !== dto.time
      || current.timezone !== dto.timezone;
    const preference = await this.repository.saveFinancialHealthPreference(userId, {
      enabled: dto.enabled,
      frequency: dto.frequency,
      weekday: dto.weekday ?? 1,
      dayOfMonth: dto.dayOfMonth ?? 1,
      time: dto.time,
      timezone: dto.timezone,
    }, resetLastSentAt);
    // A newly selected time may already be due. Dispatch it immediately rather
    // than waiting for the periodic runner's next minute.
    if (preference.enabled) await this.dispatchDueNotifications(userId);
    return this.toPreferenceResponse(preference);
  }

  async listInbox(userId: string) {
    await this.dispatchDueNotifications(userId);
    return this.repository.listForUser(userId);
  }

  markRead(userId: string, notificationId: string) {
    return this.repository.markRead(userId, notificationId);
  }

  async clearInbox(userId: string) {
    const result = await this.repository.clearForUser(userId);
    return { deleted: result.count };
  }

  getPushPublicKey() {
    return { publicKey: process.env.VAPID_PUBLIC_KEY ?? null, enabled: this.pushEnabled };
  }

  async savePushSubscription(userId: string, dto: PushSubscriptionDto) {
    try {
      return await this.repository.savePushSubscription(userId, {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent,
      });
    } catch (error) {
      this.logger.error(`Falha ao salvar assinatura push para o usuário ${userId}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async deletePushSubscription(userId: string, endpoint: string) {
    await this.repository.deletePushSubscription(userId, endpoint);
    return { deleted: true };
  }

  // Kept independent from HTTP delivery: a worker/cron can call this same method later.
  async dispatchDueNotifications(userId?: string, now = new Date()) {
    const preferenceForUser = userId
      ? await this.repository.getFinancialHealthPreference(userId)
      : null;
    const preferences = userId
      ? (preferenceForUser ? [preferenceForUser] : [])
      : await this.repository.getDuePreferences();
    await Promise.all(preferences.map(async (preference) => {
      if (!this.isDue(preference, now)) return;
      await this.repository.createNotification(preference.userId, {
        title: 'Hora de olhar sua saúde financeira',
        body: 'Veja receitas, despesas e o saldo do período nos seus gráficos.',
        href: '/charts',
      });
      await this.repository.updateLastSent(preference.id, now);
      await this.sendPushNotifications(preference.userId, {
        title: 'Hora de olhar sua saúde financeira',
        body: 'Veja receitas, despesas e o saldo do período nos seus gráficos.',
        href: '/charts',
      });
    }));
  }

  private async sendPushNotifications(userId: string, payload: { title: string; body: string; href: string }) {
    if (!this.pushEnabled) return;
    const subscriptions = await this.repository.listPushSubscriptions(userId);
    await Promise.all(subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
          JSON.stringify(payload),
        );
      } catch (error: unknown) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await this.repository.deletePushSubscriptionByEndpoint(subscription.endpoint);
          return;
        }
        this.logger.warn(`Falha ao enviar push para ${subscription.endpoint}: ${statusCode ?? 'erro desconhecido'}`);
      }
    }));
  }

  private isDue(preference: NotificationPreference, now: Date) {
    const clock = this.localClock(now, preference.timezone);
    const [hour, minute] = preference.time.split(':').map(Number);
    if (clock.minutes < hour * 60 + minute) return false;

    const last = preference.lastSentAt ? this.localClock(preference.lastSentAt, preference.timezone) : null;
    if (preference.frequency === 'WEEKLY') {
      if (clock.weekday !== preference.weekday) return false;
      return !last || this.weekKey(clock) !== this.weekKey(last);
    }

    const lastDay = new Date(clock.year, clock.month, 0).getDate();
    if (clock.day < Math.min(preference.dayOfMonth, lastDay)) return false;
    return !last || clock.year !== last.year || clock.month !== last.month;
  }

  private localClock(date: Date, timezone: string): LocalClock {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(date);
    const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.find((part) => part.type === 'weekday')?.value ?? '');
    return { year: value('year'), month: value('month'), day: value('day'), weekday, minutes: value('hour') * 60 + value('minute') };
  }

  private weekKey(clock: LocalClock) {
    const date = new Date(Date.UTC(clock.year, clock.month - 1, clock.day));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    return `${date.getUTCFullYear()}-${Math.ceil((((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7)}`;
  }

  private toPreferenceResponse(preference: NotificationPreference) {
    return {
      enabled: preference.enabled,
      frequency: preference.frequency,
      weekday: preference.weekday,
      dayOfMonth: preference.dayOfMonth,
      time: preference.time,
      timezone: preference.timezone,
    };
  }
}
