import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(name: string, userId: string) {
    return this.prisma.workspace.create({
      data: {
        name,
        members: { create: { userId, role: 'OWNER' } },
      },
      include: { members: true },
    });
  }

  listByUser(userId: string) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdForUser(userId: string, workspaceId: string) {
    return this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId } },
      },
    });
  }

  updateForUser(userId: string, workspaceId: string, data: { name?: string }) {
    return this.prisma.workspace.updateMany({
      where: {
        id: workspaceId,
        members: { some: { userId } },
      },
      data,
    });
  }

  addMember(workspaceId: string, userId: string) {
    return this.prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId, workspaceId } },
      update: {},
      create: { userId, workspaceId },
    });
  }
}
