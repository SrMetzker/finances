import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private getUtcMonthRange(month: number, year: number) {
    return {
      start: new Date(Date.UTC(year, month - 1, 1)),
      end: new Date(Date.UTC(year, month, 1)),
    };
  }

  async analytics(
    workspaceId: string,
    month: number,
    year: number,
    accountIds: string[] = [],
    categoryIds: string[] = [],
  ) {
    const { start, end } = this.getUtcMonthRange(month, year);

    const where: Prisma.TransactionWhereInput = {
      workspaceId,
      date: { gte: start, lt: end },
      type: { in: ['ENTRADA', 'SAIDA'] },
      ...(accountIds.length > 0 ? { accountId: { in: accountIds } } : {}),
      ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
    };

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: {
        type: true,
        amount: true,
        date: true,
        categoryId: true,
        accountId: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            parentCategoryId: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    type CategoryBucket = {
      categoryId: string;
      categoryName: string;
      categoryColor: string;
      rootCategoryId: string;
      subCategoryId?: string;
      total: number;
    };

    type AccountBucket = {
      accountId: string;
      accountName: string;
      accountColor: string;
      accountIcon: string;
      total: number;
    };

    const expensesByCategoryMap = new Map<string, CategoryBucket>();
    const incomesByCategoryMap = new Map<string, CategoryBucket>();
    const expensesByAccountMap = new Map<string, AccountBucket>();
    const incomesByAccountMap = new Map<string, AccountBucket>();
    const dailyMap = new Map<string, { date: string; income: number; expense: number }>();

    const totalIncome = 0;
    const totalExpense = 0;
    let incomeAcc = totalIncome;
    let expenseAcc = totalExpense;

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      const dayKey = tx.date.toISOString().slice(0, 10);
      const day = dailyMap.get(dayKey) ?? { date: dayKey, income: 0, expense: 0 };

      const categoryId = tx.categoryId;
      const categoryName = tx.category?.name ?? 'Sem categoria';
      const categoryColor = tx.category?.color ?? '#71717a';
      const rootCategoryId = tx.category?.parentCategoryId ?? categoryId;
      const subCategoryId = tx.category?.parentCategoryId ? categoryId : undefined;

      const accountId = tx.accountId;
      const accountName = tx.account?.name ?? 'Sem conta';
      const accountColor = tx.account?.color ?? '#71717a';
      const accountIcon = tx.account?.icon ?? 'wallet';

      if (tx.type === 'ENTRADA') {
        incomeAcc += amount;
        day.income += amount;

        const currentCategory = incomesByCategoryMap.get(categoryId) ?? {
          categoryId,
          categoryName,
          categoryColor,
          rootCategoryId,
          subCategoryId,
          total: 0,
        };
        currentCategory.total += amount;
        incomesByCategoryMap.set(categoryId, currentCategory);

        const currentAccount = incomesByAccountMap.get(accountId) ?? {
          accountId,
          accountName,
          accountColor,
          accountIcon,
          total: 0,
        };
        currentAccount.total += amount;
        incomesByAccountMap.set(accountId, currentAccount);
      }

      if (tx.type === 'SAIDA') {
        expenseAcc += amount;
        day.expense += amount;

        const currentCategory = expensesByCategoryMap.get(categoryId) ?? {
          categoryId,
          categoryName,
          categoryColor,
          rootCategoryId,
          subCategoryId,
          total: 0,
        };
        currentCategory.total += amount;
        expensesByCategoryMap.set(categoryId, currentCategory);

        const currentAccount = expensesByAccountMap.get(accountId) ?? {
          accountId,
          accountName,
          accountColor,
          accountIcon,
          total: 0,
        };
        currentAccount.total += amount;
        expensesByAccountMap.set(accountId, currentAccount);
      }

      dailyMap.set(dayKey, day);
    }

    const dailyFlow: Array<{ date: string; income: number; expense: number }> = [];
    const cursor = new Date(start);
    while (cursor < end) {
      const key = cursor.toISOString().slice(0, 10);
      dailyFlow.push(dailyMap.get(key) ?? { date: key, income: 0, expense: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      month,
      year,
      totals: {
        income: incomeAcc,
        expense: expenseAcc,
        balance: incomeAcc - expenseAcc,
      },
      expensesByCategory: [...expensesByCategoryMap.values()].sort(
        (a, b) => b.total - a.total,
      ),
      incomesByCategory: [...incomesByCategoryMap.values()].sort(
        (a, b) => b.total - a.total,
      ),
      expensesByAccount: [...expensesByAccountMap.values()].sort(
        (a, b) => b.total - a.total,
      ),
      incomesByAccount: [...incomesByAccountMap.values()].sort(
        (a, b) => b.total - a.total,
      ),
      dailyFlow,
    };
  }

  async monthly(workspaceId: string, month: number, year: number) {
    const { start, end } = this.getUtcMonthRange(month, year);

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
            where: {
              workspaceId,
              accountId: account.id,
              type: 'TRANSFERENCIA',
            },
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

    const { start, end } = this.getUtcMonthRange(month, year);

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
