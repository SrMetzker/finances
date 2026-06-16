-- Add Supabase Auth mapping and lead capture fields without touching existing user IDs.
ALTER TABLE "User"
ADD COLUMN "supabaseAuthId" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "leadSource" TEXT,
ADD COLUMN "leadCampaign" TEXT,
ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN "migratedToSupabaseAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_supabaseAuthId_key" ON "User"("supabaseAuthId");