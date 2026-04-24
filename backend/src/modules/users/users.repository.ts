import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

export type UserEntity = {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; email: string; password: string }) {
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

  updateProfile(
    id: string,
    data: { name?: string; avatarUrl?: string | null },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    }) as Promise<UserEntity>;
  }

  updatePassword(id: string, password: string) {
    return this.prisma.user.update({ where: { id }, data: { password } });
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
