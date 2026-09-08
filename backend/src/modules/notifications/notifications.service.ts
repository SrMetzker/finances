import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { NotificationPreference } from '@prisma/client';
import { NotificationsRepository } from './notifications.repository';
import { UpdateFinancialHealthPreferenceDto } from './dto/update-financial-health-preference.dto';

type LocalClock = { year: number; month: number; day: number; weekday: number; minutes: number };

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private dispatchTimer?: ReturnType<typeof setInterval>;

  constructor(private readonly repository: NotificationsRepository) {}

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
    return preference ?? {
      enabled: false, frequency: 'WEEKLY', weekday: 1, dayOfMonth: 1, time: '09:00', timezone: 'Europe/Madrid',
    };
  }

  updateFinancialHealthPreference(userId: string, dto: UpdateFinancialHealthPreferenceDto) {
    return this.repository.saveFinancialHealthPreference(userId, {
      enabled: dto.enabled,
      frequency: dto.frequency,
      weekday: dto.weekday ?? 1,
      dayOfMonth: dto.dayOfMonth ?? 1,
      time: dto.time,
      timezone: dto.timezone,
    });
  }

  async listInbox(userId: string) {
    await this.dispatchDueNotifications(userId);
    return this.repository.listForUser(userId);
  }

  markRead(userId: string, notificationId: string) {
    return this.repository.markRead(userId, notificationId);
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
}
