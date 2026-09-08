import { Injectable } from '@nestjs/common';
import { NotificationChannel, NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getFinancialHealthPreference(userId: string) {
    return this.prisma.notificationPreference.findUnique({
      where: {
        userId_type_channel: {
          userId,
          type: NotificationType.FINANCIAL_HEALTH,
          channel: NotificationChannel.IN_APP,
        },
      },
    });
  }

  saveFinancialHealthPreference(
    userId: string,
    data: {
      enabled: boolean;
      frequency: 'WEEKLY' | 'MONTHLY';
      weekday: number;
      dayOfMonth: number;
      time: string;
      timezone: string;
    },
    resetLastSentAt = false,
  ) {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_type_channel: {
          userId,
          type: NotificationType.FINANCIAL_HEALTH,
          channel: NotificationChannel.IN_APP,
        },
      },
      create: { userId, type: NotificationType.FINANCIAL_HEALTH, channel: NotificationChannel.IN_APP, ...data },
      update: { ...data, ...(resetLastSentAt ? { lastSentAt: null } : {}) },
    });
  }

  getDuePreferences() {
    return this.prisma.notificationPreference.findMany({
      where: { enabled: true, channel: NotificationChannel.IN_APP },
    });
  }

  createNotification(userId: string, data: { title: string; body: string; href: string }) {
    return this.prisma.notification.create({
      data: { userId, type: NotificationType.FINANCIAL_HEALTH, ...data },
    });
  }

  updateLastSent(id: string, lastSentAt: Date) {
    return this.prisma.notificationPreference.update({ where: { id }, data: { lastSentAt } });
  }

  listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  markRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
