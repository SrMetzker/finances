import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    workspaceId: string,
    data: { name: string; initialBalance: number },
  ) {
    return this.prisma.account.create({
      data: { name: data.name, initialBalance: data.initialBalance, workspaceId },
    });
  }

  findAll(workspaceId: string) {
    return this.prisma.account.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(workspaceId: string, id: string) {
    return this.prisma.account.findFirst({ where: { id, workspaceId } });
  }

  update(
    workspaceId: string,
    id: string,
    data: Prisma.AccountUpdateManyMutationInput,
  ) {
    return this.prisma.account.updateMany({
      where: { id, workspaceId },
      data,
    });
  }

  remove(workspaceId: string, id: string) {
    return this.prisma.account.deleteMany({ where: { id, workspaceId } });
  }

  async balanceSummary(workspaceId: string) {
    const accounts = await this.findAll(workspaceId);

    return Promise.all(
      accounts.map(async (account) => {
        const [income, expense, transferOut, transferIn] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: { workspaceId, accountId: account.id, type: 'ENTRADA' },
            _sum: { amount: true },
          }),
          this.prisma.transaction.aggregate({
            where: { workspaceId, accountId: account.id, type: 'SAIDA' },
            _sum: { amount: true },
          }),
          this.prisma.transaction.aggregate({
            where: { workspaceId, accountId: account.id, type: 'TRANSFERENCIA' },
            _sum: { amount: true },
          }),
          this.prisma.transaction.aggregate({
            where: {
              workspaceId,
              destinationAccountId: account.id,
              type: 'TRANSFERENCIA',
            },
            _sum: { amount: true },
          }),
        ]);

        const currentBalance =
          Number(account.initialBalance) +
          Number(income._sum.amount ?? 0) -
          Number(expense._sum.amount ?? 0) -
          Number(transferOut._sum.amount ?? 0) +
          Number(transferIn._sum.amount ?? 0);

        return {
          id: account.id,
          name: account.name,
          workspaceId: account.workspaceId,
          initialBalance: Number(account.initialBalance),
          currentBalance,
        };
      }),
    );
  }
}
