import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type CardData = {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
};

@Injectable()
export class CardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(workspaceId: string, data: CardData) {
    return this.prisma.card.create({ data: { ...data, workspaceId } });
  }

  findAll(workspaceId: string) {
    return this.prisma.card.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(workspaceId: string, id: string) {
    return this.prisma.card.findFirst({ where: { id, workspaceId } });
  }

  update(workspaceId: string, id: string, data: Partial<CardData>) {
    return this.prisma.card.updateMany({ where: { id, workspaceId }, data });
  }

  remove(workspaceId: string, id: string) {
    return this.prisma.card.deleteMany({ where: { id, workspaceId } });
  }
}
