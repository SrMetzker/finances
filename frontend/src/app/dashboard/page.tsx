'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { useTransactions } from '@/hooks/use-transactions-api';
import { useAccounts } from '@/hooks/use-accounts-api';
import { alphaHex, getIconComponent } from '@/lib/visual-options';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/services/auth.context';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Plus,
} from 'lucide-react';

type PeriodOption = 7 | 14 | 30;

const PERIOD_OPTIONS: PeriodOption[] = [7, 14, 30];
const PIE_COLORS = ['#a3e635', '#84cc16', '#65a30d', '#facc15', '#22c55e', '#bef264'];

function resolveChartColor(color: string | undefined, index: number) {
  const trimmed = color?.trim();
  if (trimmed) {
    return trimmed;
  }

  return PIE_COLORS[index % PIE_COLORS.length];
}

function toDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

export default function DashboardPage() {
  const [showValues, setShowValues] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(7);
  const { transactions } = useTransactions();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { workspaceId, workspace, workspaces, setWorkspaceId } = useAuth();

  const totalBalance = accounts.reduce((s, a) => s + Number(a.currentBalance), 0);
  const totalIncome = transactions.filter((t) => t.type === 'ENTRADA').reduce(
    (s, t) => s + Number(t.amount),
    0,
  );
  const totalExpense = transactions.filter((t) => t.type === 'SAIDA').reduce(
    (s, t) => s + Number(t.amount),
    0,
  );

  const money = (value: number) =>
    showValues ? formatCurrency(value, workspace?.currency ?? 'EUR') : '••••';

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (selectedPeriod - 1));

    return transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      if (Number.isNaN(date.getTime())) {
        return false;
      }

      return date >= startDate && date <= now;
    });
  }, [transactions, selectedPeriod]);

  const incomeSeries = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (selectedPeriod - 1));

    const incomeByDay = new Map<string, number>();
    for (const transaction of filteredTransactions) {
      if (transaction.type !== 'ENTRADA') {
        continue;
      }

      const date = new Date(transaction.date);
      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const key = toDayKey(date);
      incomeByDay.set(key, (incomeByDay.get(key) ?? 0) + Number(transaction.amount));
    }

    const series: Array<{ key: string; label: string; value: number }> = [];

    for (let offset = 0; offset < selectedPeriod; offset += 1) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + offset);
      const key = toDayKey(day);
      series.push({
        key,
        label: formatDayLabel(day),
        value: incomeByDay.get(key) ?? 0,
      });
    }

    return series;
  }, [filteredTransactions, selectedPeriod]);

  const expenseCategories = useMemo(() => {
    const expensesByCategory = new Map<string, { category: string; amount: number; color?: string }>();

    for (const transaction of filteredTransactions) {
      if (transaction.type !== 'SAIDA') {
        continue;
      }

      const categoryKey = transaction.categoryId || transaction.category?.name?.trim() || 'uncategorized';
      const categoryName = transaction.category?.name?.trim() || 'Sem categoria';
      const current = expensesByCategory.get(categoryKey);

      expensesByCategory.set(categoryKey, {
        category: categoryName,
        amount: (current?.amount ?? 0) + Number(transaction.amount),
        color: current?.color || transaction.category?.color,
      });
    }

    const sorted = [...expensesByCategory.values()]
      .sort((a, b) => b.amount - a.amount);

    const top = sorted.slice(0, 5);
    const other = sorted.slice(5).reduce((sum, item) => sum + item.amount, 0);
    if (other > 0) {
      top.push({ category: 'Outras', amount: other, color: '#71717a' });
    }

    return top;
  }, [filteredTransactions]);

  const hasTransactionsInPeriod = filteredTransactions.length > 0;
  const maxIncome = Math.max(...incomeSeries.map((item) => item.value), 0);
  const totalExpensesByCategory = expenseCategories.reduce((sum, item) => sum + item.amount, 0);

  return (
    <PageShell
      title={
        <label className="block w-full max-w-56">
          <span className="sr-only">Selecionar workspace</span>
          <select
            value={workspaceId ?? ''}
            onChange={(event) => setWorkspaceId(event.target.value)}
            className="brand-panel w-full appearance-none rounded-full border border-white/8 px-4 py-2 text-center text-sm font-semibold text-zinc-100 outline-none transition focus:border-lime-300"
            aria-label="Selecionar workspace"
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </label>
      }
    >
      {/* balance header */}
      <div className="px-4 pt-6 pb-7 text-center">
        <p className="text-sm text-zinc-400 mb-1">Saldo em contas</p>
        <p className="text-4xl font-bold tracking-tight">
          {accountsLoading ? '....' : money(totalBalance)}
        </p>
        <button
          type="button"
          onClick={() => setShowValues((v) => !v)}
          className="mx-auto mt-3 text-zinc-500"
          aria-label={showValues ? 'Ocultar valores' : 'Exibir valores'}
        >
          {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

        <div className="mt-5 flex justify-center gap-12">
          {/* income */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <ArrowUp size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs text-zinc-400">Receitas</p>
              <p className="text-sm font-semibold text-green-400">{money(totalIncome)}</p>
            </div>
          </div>
          {/* expense */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
              <ArrowDown size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs text-zinc-400">Despesas</p>
              <p className="text-sm font-semibold text-red-400">{money(totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* accounts card */}
      <div className="brand-surface mx-4 mb-4 rounded-[1.75rem] p-4">
        <div className="flex items-center justify-between mb-1">
          <Link href="/accounts" className="font-semibold text-base">
            Contas
          </Link>
          <LayoutGrid size={18} className="text-zinc-400" />
        </div>
        <ul>
          {accounts.map((account, i) => {
            const AccountIcon = getIconComponent(account.icon);

            return (
            <li
              key={account.id}
              className={`flex items-center justify-between py-3 ${
                i < accounts.length - 1 ? 'border-b border-zinc-700/40' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: alphaHex(account.color, '22'),
                    borderColor: alphaHex(account.color, '66'),
                  }}
                >
                  <AccountIcon size={16} style={{ color: account.color }} />
                </div>
                <div>
                  <p className="font-medium text-sm">{account.name}</p>
                  <p className="text-sm text-green-400">{money(Number(account.currentBalance))}</p>
                </div>
              </div>
              <button className="font-light text-lime-300" aria-label="Adicionar">
                <Plus size={20} />
              </button>
            </li>
            );
          })}
        </ul>
        <div className="border-t border-zinc-700/40 mt-1 pt-3 flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{money(totalBalance)}</span>
        </div>
      </div>

      {/* evolution section */}
      <div className="brand-surface mx-4 mb-4 rounded-[1.75rem] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Evolução</h3>
          <div className="flex items-center gap-1 rounded-full border border-white/8 bg-white/5 p-1">
            {PERIOD_OPTIONS.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriod(period)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  selectedPeriod === period
                    ? 'brand-gradient text-zinc-950'
                    : 'text-zinc-300 hover:bg-white/8'
                }`}
              >
                {period}d
              </button>
            ))}
          </div>
        </div>

        {!hasTransactionsInPeriod ? (
          <div className="brand-panel rounded-2xl border border-white/6 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-zinc-100">Não há movimentações no período selecionado.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="brand-panel rounded-2xl border border-white/6 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-100">Receitas por dia</p>
                <p className="text-xs text-zinc-400">
                  Total: {formatCurrency(
                    incomeSeries.reduce((sum, item) => sum + item.value, 0),
                    workspace?.currency ?? 'EUR',
                  )}
                </p>
              </div>

              {maxIncome === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-400">Sem receitas no período selecionado.</p>
              ) : (
                <>
                  <svg viewBox="0 0 320 150" className="h-40 w-full">
                    <defs>
                      <linearGradient id="income-line-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#bef264" />
                        <stop offset="100%" stopColor="#facc15" />
                      </linearGradient>
                    </defs>

                    <line x1="12" y1="126" x2="308" y2="126" stroke="rgba(255,255,255,0.12)" />

                    <polyline
                      fill="none"
                      stroke="url(#income-line-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={incomeSeries
                        .map((item, index) => {
                          const x = incomeSeries.length === 1 ? 160 : 12 + (index * 296) / (incomeSeries.length - 1);
                          const y = 126 - (item.value / maxIncome) * 100;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />

                    {incomeSeries.map((item, index) => {
                      const x = incomeSeries.length === 1 ? 160 : 12 + (index * 296) / (incomeSeries.length - 1);
                      const y = 126 - (item.value / maxIncome) * 100;
                      return <circle key={item.key} cx={x} cy={y} r="3.5" fill="#bef264" />;
                    })}
                  </svg>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{incomeSeries[0]?.label}</span>
                    <span>{incomeSeries[Math.floor(incomeSeries.length / 2)]?.label}</span>
                    <span>{incomeSeries[incomeSeries.length - 1]?.label}</span>
                  </div>
                </>
              )}
            </div>

            <div className="brand-panel rounded-2xl border border-white/6 p-4">
              <p className="mb-3 text-sm font-semibold text-zinc-100">Despesas por categoria</p>

              {expenseCategories.length === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-400">Sem despesas no período selecionado.</p>
              ) : (
                <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[180px_1fr]">
                  <div className="mx-auto">
                    <svg viewBox="0 0 140 140" className="h-40 w-40">
                      {expenseCategories.map((item, index) => {
                        const previousTotal = expenseCategories
                          .slice(0, index)
                          .reduce((sum, category) => sum + category.amount, 0);
                        const startAngle = (previousTotal / totalExpensesByCategory) * 360 - 90;
                        const endAngle =
                          ((previousTotal + item.amount) / totalExpensesByCategory) * 360 - 90;

                        return (
                          <path
                            key={item.category}
                            d={describeArcPath(70, 70, 58, startAngle, endAngle)}
                            fill={resolveChartColor(item.color, index)}
                            stroke="rgba(12, 14, 22, 0.75)"
                            strokeWidth="1"
                          />
                        );
                      })}
                      <circle cx="70" cy="70" r="30" fill="rgba(15, 17, 24, 0.95)" />
                    </svg>
                  </div>

                  <div className="space-y-2">
                    {expenseCategories.map((item, index) => {
                      const percent = (item.amount / totalExpensesByCategory) * 100;

                      return (
                        <div key={item.category} className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: resolveChartColor(item.color, index) }}
                            />
                            <span className="truncate text-zinc-200">{item.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-zinc-100">{percent.toFixed(1)}%</p>
                            <p className="text-xs text-zinc-400">
                              {formatCurrency(item.amount, workspace?.currency ?? 'EUR')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
