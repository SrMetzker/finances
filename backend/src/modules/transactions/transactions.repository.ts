import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type TransactionInput = {
  amount: number;
  type: TransactionType;
  date: Date;
  description: string;
  note?: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId: string;
  userId: string;
  isPaid?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: string;
  receiptUrl?: string;
  tags?: string[];
};

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(workspaceId: string, data: TransactionInput) {
    const { tags, ...rest } = data;
    return this.prisma.transaction.create({
      data: {
        ...rest,
        workspaceId,
        ...(tags?.length
          ? { tags: { createMany: { data: tags.map((name) => ({ name })) } } }
          : {}),
      },
      include: {
        tags: true,
        account: true,
        destinationAccount: true,
        category: true,
      },
    });
  }

  findAll(workspaceId: string, month?: number, year?: number) {
    const where: Record<string, unknown> = { workspaceId };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      where.date = { gte: start, lt: end };
    }
    return this.prisma.transaction.findMany({
      where,
      include: {
        tags: true,
        account: true,
        destinationAccount: true,
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  findById(workspaceId: string, id: string) {
    return this.prisma.transaction.findFirst({
      where: { id, workspaceId },
      include: {
        tags: true,
        account: true,
        destinationAccount: true,
        category: true,
      },
    });
  }

  async update(
    workspaceId: string,
    id: string,
    data: Partial<TransactionInput>,
  ) {
    const { tags, ...rest } = data;
    return this.prisma.$transaction(async (trx) => {
      if (tags !== undefined) {
        await trx.transactionTag.deleteMany({ where: { transactionId: id } });
        if (tags.length) {
          await trx.transactionTag.createMany({
            data: tags.map((name) => ({ transactionId: id, name })),
          });
        }
      }
      return trx.transaction.updateMany({
        where: { id, workspaceId },
        data: rest,
      });
    });
  }

  remove(workspaceId: string, id: string) {
    return this.prisma.transaction.deleteMany({ where: { id, workspaceId } });
  }
}
