import { Injectable } from '@nestjs/common';
import { CategoryType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(workspaceId: string, data: { name: string; type: CategoryType }) {
    return this.prisma.category.create({ data: { ...data, workspaceId } });
  }

  findAll(workspaceId: string) {
    return this.prisma.category.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
  }

  findById(workspaceId: string, id: string) {
    return this.prisma.category.findFirst({ where: { id, workspaceId } });
  }

  update(
    workspaceId: string,
    id: string,
    data: { name?: string; type?: CategoryType },
  ) {
    return this.prisma.category.updateMany({
      where: { id, workspaceId },
      data,
    });
  }

  remove(workspaceId: string, id: string) {
    return this.prisma.category.deleteMany({ where: { id, workspaceId } });
  }
}
