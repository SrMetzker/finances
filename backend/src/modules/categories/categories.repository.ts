import { Injectable } from '@nestjs/common';
import { CategoryType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    workspaceId: string,
    data: {
      name: string;
      type: CategoryType;
      icon: string;
      color: string;
      parentCategoryId?: string;
    },
  ) {
    return this.prisma.category.create({ data: { ...data, workspaceId } });
  }

  findAll(workspaceId: string) {
    return this.prisma.category.findMany({
      where: { workspaceId, type: { not: 'TRANSFERENCIA' } },
      orderBy: { name: 'asc' },
    });
  }

  findById(workspaceId: string, id: string) {
    return this.prisma.category.findFirst({ where: { id, workspaceId } });
  }

  update(
    workspaceId: string,
    id: string,
    data: {
      name?: string;
      type?: CategoryType;
      icon?: string;
      color?: string;
      parentCategoryId?: string | null;
    },
  ) {
    return this.prisma.category.updateMany({
      where: { id, workspaceId },
      data,
    });
  }

  remove(workspaceId: string, id: string) {
    return this.prisma.category.deleteMany({ where: { id, workspaceId } });
  }

  countTransactionsByCategory(workspaceId: string, categoryId: string) {
    return this.prisma.transaction.count({
      where: { workspaceId, categoryId },
    });
  }

  countSubcategories(workspaceId: string, categoryId: string) {
    return this.prisma.category.count({
      where: { workspaceId, parentCategoryId: categoryId },
    });
  }

  findByName(
    workspaceId: string,
    name: string,
    parentCategoryId: string | null,
  ) {
    return this.prisma.category.findFirst({
      where: {
        workspaceId,
        name: { equals: name, mode: 'insensitive' },
        parentCategoryId: parentCategoryId ?? null,
        type: { not: 'TRANSFERENCIA' },
      },
    });
  }

  updateChildrenColor(
    workspaceId: string,
    parentCategoryId: string,
    color: string,
  ) {
    return this.prisma.category.updateMany({
      where: { workspaceId, parentCategoryId },
      data: { color },
    });
  }
}
