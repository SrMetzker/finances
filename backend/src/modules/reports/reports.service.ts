import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async monthly(workspaceId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const [incomes, expenses] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { workspaceId, type: 'ENTRADA', date: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { workspaceId, type: 'SAIDA', date: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomes._sum.amount ?? 0);
    const totalExpense = Number(expenses._sum.amount ?? 0);

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  async dashboard(workspaceId: string, month: number, year: number) {
    const accounts = await this.prisma.account.findMany({
      where: { workspaceId },
    });

    const balances = await Promise.all(
      accounts.map(async (account) => {
        const [income, expense, txOut, txIn] = await Promise.all([
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

        const balance =
          Number(account.initialBalance) +
          Number(income._sum.amount ?? 0) -
          Number(expense._sum.amount ?? 0) -
          Number(txOut._sum.amount ?? 0) +
          Number(txIn._sum.amount ?? 0);

        return { accountId: account.id, accountName: account.name, balance };
      }),
    );

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const byCategory = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { workspaceId, type: 'SAIDA', date: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    const categories = await this.prisma.category.findMany({
      where: { id: { in: byCategory.map((r) => r.categoryId) } },
    });

    return {
      totalBalance: balances.reduce((s, b) => s + b.balance, 0),
      balances,
      expensesByCategory: byCategory.map((r) => ({
        categoryId: r.categoryId,
        categoryName:
          categories.find((c) => c.id === r.categoryId)?.name ?? '–',
        total: Number(r._sum.amount ?? 0),
      })),
    };
  }
}
