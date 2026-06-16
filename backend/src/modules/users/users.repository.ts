import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

export type UserEntity = {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
  lastWorkspaceId?: string | null;
  supabaseAuthId?: string | null;
  phone?: string | null;
  marketingConsent?: boolean;
  leadSource?: string | null;
  leadCampaign?: string | null;
  authProvider?: string;
  migratedToSupabaseAt?: Date | null;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    name: string;
    email: string;
    password: string;
    avatarUrl?: string | null;
    supabaseAuthId?: string | null;
    phone?: string | null;
    marketingConsent?: boolean;
    leadSource?: string | null;
    leadCampaign?: string | null;
    authProvider?: string;
    migratedToSupabaseAt?: Date | null;
  }) {
    return this.prisma.user.create({ data }) as Promise<UserEntity>;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    }) as Promise<UserEntity | null>;
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    }) as Promise<UserEntity | null>;
  }

  findBySupabaseAuthId(supabaseAuthId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseAuthId },
    }) as Promise<UserEntity | null>;
  }

  updateProfile(
    id: string,
    data: { name?: string; avatarUrl?: string | null; phone?: string | null },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    }) as Promise<UserEntity>;
  }

  updatePassword(id: string, password: string) {
    return this.prisma.user.update({ where: { id }, data: { password } });
  }

  async hasWorkspaceAccess(userId: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      select: { id: true },
    });

    return !!membership;
  }

  updateLastWorkspace(id: string, workspaceId: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastWorkspaceId: workspaceId },
    }) as Promise<UserEntity>;
  }

  updateSupabaseLink(
    id: string,
    data: {
      supabaseAuthId: string;
      phone?: string | null;
      marketingConsent?: boolean;
      leadSource?: string | null;
      leadCampaign?: string | null;
      authProvider?: string;
      migratedToSupabaseAt?: Date;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    }) as Promise<UserEntity>;
  }

  async clearWorkspaceFinancialDataByUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true },
    });

    const workspaceIds = memberships.map((item) => item.workspaceId);
    if (workspaceIds.length === 0) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.transaction.deleteMany({
        where: { workspaceId: { in: workspaceIds } },
      }),
      this.prisma.account.deleteMany({
        where: { workspaceId: { in: workspaceIds } },
      }),
      this.prisma.card.deleteMany({
        where: { workspaceId: { in: workspaceIds } },
      }),
      this.prisma.category.deleteMany({
        where: { workspaceId: { in: workspaceIds } },
      }),
    ] as Prisma.PrismaPromise<unknown>[]);
  }

  async deleteAccount(userId: string) {
    await this.clearWorkspaceFinancialDataByUser(userId);
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
