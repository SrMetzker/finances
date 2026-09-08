CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP');
CREATE TYPE "NotificationFrequency" AS ENUM ('WEEKLY', 'MONTHLY');
CREATE TYPE "NotificationType" AS ENUM ('FINANCIAL_HEALTH');

CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "NotificationFrequency" NOT NULL DEFAULT 'WEEKLY',
    "weekday" INTEGER NOT NULL DEFAULT 1,
    "dayOfMonth" INTEGER NOT NULL DEFAULT 1,
    "time" TEXT NOT NULL DEFAULT '09:00',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationPreference_userId_type_channel_key" ON "NotificationPreference"("userId", "type", "channel");
CREATE INDEX "NotificationPreference_enabled_type_idx" ON "NotificationPreference"("enabled", "type");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
