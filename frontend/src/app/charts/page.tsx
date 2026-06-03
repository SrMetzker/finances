'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { useMonthFilter } from '@/hooks/use-month-filter';
import { useReportsAnalytics } from '@/hooks/use-reports-api';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/services/auth.context';
import {
  ChartPie,
  ChartLine,
  ChartColumn,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { ReportAccountSlice, ReportCategorySlice } from '@/services/api.types';

type ChartKind = 'pie' | 'line' | 'bar';
type MetricKind = 'expenseCategory' | 'expenseAccount' | 'incomeCategory' | 'incomeAccount' | 'dailyFlow';

type ChartMetricItem = {
  id: string;
  label: string;
  value: number;
  color?: string;
  onClick?: () => void;
};

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const CHART_COLORS = ['#bef264', '#84cc16', '#a3e635', '#22c55e', '#65a30d', '#facc15'];

function resolveColor(index: number, custom?: string) {
  if (custom?.trim()) {
    return custom;
  }

  return CHART_COLORS[index % CHART_COLORS.length];
}

function formatDayLabel(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function PieChartSvg({
  values,
}: {
  values: Array<{ value: number; color?: string }>;
}) {
  const total = values.reduce((sum, item) => sum + item.value, 0);
  const radius = 58;

  if (total <= 0) {
    return (
      <svg viewBox="0 0 140 140" className="h-44 w-44">
        <circle cx="70" cy="70" r={radius} fill="rgba(255,255,255,0.04)" />
        <circle cx="70" cy="70" r="30" fill="rgba(15, 17, 24, 0.95)" />
      </svg>
    );
  }

  function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  }

  function describeArcPath(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  }

  return (
    <svg viewBox="0 0 140 140" className="h-44 w-44">
      {values.map((item, index) => {
        const previous = values.slice(0, index).reduce((sum, current) => sum + current.value, 0);
        const startAngle = (previous / total) * 360 - 90;
        const endAngle = ((previous + item.value) / total) * 360 - 90;

        return (
          <path
            key={`pie-${index}`}
            d={describeArcPath(70, 70, radius, startAngle, endAngle)}
            fill={resolveColor(index, item.color)}
            stroke="rgba(12, 14, 22, 0.75)"
            strokeWidth="1"
          />
        );
      })}
      <circle cx="70" cy="70" r="30" fill="rgba(15, 17, 24, 0.95)" />
    </svg>
  );
}

function LineChartSvg({
  values,
}: {
  values: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...values.map((item) => item.value), 0);

  if (max <= 0) {
    return <p className="py-16 text-center text-sm text-zinc-400">Sem dados para o período selecionado.</p>;
  }

  return (
    <svg viewBox="0 0 320 160" className="h-44 w-full">
      <line x1="12" y1="136" x2="308" y2="136" stroke="rgba(255,255,255,0.12)" />
      <polyline
        fill="none"
        stroke="#bef264"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={values
          .map((item, index) => {
            const x = values.length === 1 ? 160 : 12 + (index * 296) / (values.length - 1);
            const y = 136 - (item.value / max) * 110;
            return `${x},${y}`;
          })
          .join(' ')}
      />
      {values.map((item, index) => {
        const x = values.length === 1 ? 160 : 12 + (index * 296) / (values.length - 1);
        const y = 136 - (item.value / max) * 110;

        return <circle key={`line-${item.label}-${index}`} cx={x} cy={y} r="3.5" fill="#bef264" />;
      })}
    </svg>
  );
}

function BarChartSvg({
  values,
}: {
  values: Array<{ label: string; value: number; color?: string }>;
}) {
  const max = Math.max(...values.map((item) => item.value), 0);

  if (max <= 0) {
    return <p className="py-16 text-center text-sm text-zinc-400">Sem dados para o período selecionado.</p>;
  }

  const barGap = 6;
  const totalBarWidth = 296;
  const barWidth = Math.max(8, (totalBarWidth - barGap * (values.length - 1)) / values.length);

  return (
    <svg viewBox="0 0 320 160" className="h-44 w-full">
      <line x1="12" y1="136" x2="308" y2="136" stroke="rgba(255,255,255,0.12)" />
      {values.map((item, index) => {
        const height = (item.value / max) * 108;
        const x = 12 + index * (barWidth + barGap);
        const y = 136 - height;

        return (
          <rect
            key={`bar-${item.label}-${index}`}
            x={x}
            y={y}
            width={barWidth}
            height={height}
            rx="5"
            fill={resolveColor(index, item.color)}
          />
        );
      })}
    </svg>
  );
}

export default function ChartsPage() {
  const router = useRouter();
  const { workspace } = useAuth();
  const { month, setMonth, parsed } = useMonthFilter(new Date());
  const { data, isLoading, error } = useReportsAnalytics(parsed.month, parsed.year);
  const [chartKind, setChartKind] = useState<ChartKind>('pie');
  const [metricKind, setMetricKind] = useState<MetricKind>('expenseCategory');

  const money = (value: number) => formatCurrency(value, workspace?.currency ?? 'EUR');

  const metricTabs: Array<{ id: MetricKind; label: string }> = [
    { id: 'expenseCategory', label: 'Despesas por categoria' },
    { id: 'expenseAccount', label: 'Despesas por conta' },
    { id: 'incomeCategory', label: 'Receitas por categoria' },
    { id: 'incomeAccount', label: 'Receitas por conta' },
    { id: 'dailyFlow', label: 'Fluxo diário' },
  ];

  const currentMetricItems = useMemo<ChartMetricItem[]>(() => {
    if (!data) {
      return [];
    }

    const redirectToMonth = `${data.year}-${String(data.month).padStart(2, '0')}`;

    if (metricKind === 'expenseCategory') {
      return data.expensesByCategory.map((item) => ({
        id: item.categoryId,
        label: item.categoryName,
        value: item.total,
        color: item.categoryColor,
        onClick: () => {
          const params = new URLSearchParams();
          params.set('month', redirectToMonth);
          params.set('categoryRootIds', item.rootCategoryId);
          if (item.subCategoryId) {
            params.set('categorySubIds', item.subCategoryId);
          }
          router.push(`/transactions?${params.toString()}`);
        },
      }));
    }

    if (metricKind === 'incomeCategory') {
      return data.incomesByCategory.map((item) => ({
        id: item.categoryId,
        label: item.categoryName,
        value: item.total,
        color: item.categoryColor,
        onClick: () => {
          const params = new URLSearchParams();
          params.set('month', redirectToMonth);
          params.set('categoryRootIds', item.rootCategoryId);
          if (item.subCategoryId) {
            params.set('categorySubIds', item.subCategoryId);
          }
          router.push(`/transactions?${params.toString()}`);
        },
      }));
    }

    if (metricKind === 'expenseAccount') {
      return data.expensesByAccount.map((item) => ({
        id: item.accountId,
        label: item.accountName,
        value: item.total,
        color: item.accountColor,
        onClick: () => {
          const params = new URLSearchParams();
          params.set('month', redirectToMonth);
          params.set('accountIds', item.accountId);
          router.push(`/transactions?${params.toString()}`);
        },
      }));
    }

    if (metricKind === 'incomeAccount') {
      return data.incomesByAccount.map((item) => ({
        id: item.accountId,
        label: item.accountName,
        value: item.total,
        color: item.accountColor,
        onClick: () => {
          const params = new URLSearchParams();
          params.set('month', redirectToMonth);
          params.set('accountIds', item.accountId);
          router.push(`/transactions?${params.toString()}`);
        },
      }));
    }

    return data.dailyFlow.map((item) => ({
      id: item.date,
      label: formatDayLabel(item.date),
      value: item.income + item.expense,
      onClick: () => {
        const params = new URLSearchParams();
        params.set('month', redirectToMonth);
        params.set('useDateRange', '1');
        params.set('dateFrom', item.date);
        params.set('dateTo', item.date);
        router.push(`/transactions?${params.toString()}`);
      },
    }));
  }, [data, metricKind, router]);

  const lineValues = useMemo(() => {
    if (!data) {
      return [] as Array<{ label: string; value: number }>;
    }

    if (metricKind === 'dailyFlow') {
      return data.dailyFlow.map((item) => ({
        label: formatDayLabel(item.date),
        value: item.income + item.expense,
      }));
    }

    return currentMetricItems.map((item) => ({ label: item.label, value: item.value }));
  }, [data, metricKind, currentMetricItems]);

  function prevMonth() {
    const date = new Date(`${month}-01`);
    date.setMonth(date.getMonth() - 1);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  function nextMonth() {
    const date = new Date(`${month}-01`);
    date.setMonth(date.getMonth() + 1);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  return (
    <PageShell title="Gráficos" backHref="/more">
      <div className="px-4 py-4 space-y-4">
        <div className="brand-surface rounded-[1.75rem] p-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'pie', icon: ChartPie },
              { id: 'line', icon: ChartLine },
              { id: 'bar', icon: ChartColumn },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setChartKind(item.id as ChartKind)}
                className={`flex items-center justify-center rounded-2xl py-2.5 transition ${
                  chartKind === item.id
                    ? 'brand-gradient text-zinc-950'
                    : 'text-zinc-300 hover:bg-white/6'
                }`}
              >
                <item.icon size={22} />
              </button>
            ))}
          </div>
        </div>

        <div className="brand-surface rounded-[1.75rem] p-4">
          <div className="mb-4 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {metricTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMetricKind(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    metricKind === tab.id
                      ? 'brand-gradient text-zinc-950'
                      : 'bg-white/8 text-zinc-300 hover:bg-white/12'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded-full p-1 text-zinc-300 hover:bg-zinc-800/60"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <p className="font-semibold text-zinc-100">{MONTH_NAMES[parsed.month - 1]}</p>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-full p-1 text-zinc-300 hover:bg-zinc-800/60"
              aria-label="Próximo mês"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {isLoading ? (
            <p className="py-16 text-center text-sm text-zinc-400">Carregando gráficos...</p>
          ) : error ? (
            <p className="py-16 text-center text-sm text-rose-300">{error}</p>
          ) : !data ? (
            <p className="py-16 text-center text-sm text-zinc-400">Sem dados disponíveis.</p>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/8 p-3 text-center">
                <div>
                  <p className="text-[11px] text-zinc-500">Receitas</p>
                  <p className="font-semibold text-green-400">{money(data.totals.income)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">Despesas</p>
                  <p className="font-semibold text-red-400">{money(data.totals.expense)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">Saldo</p>
                  <p className={`font-semibold ${data.totals.balance >= 0 ? 'text-lime-300' : 'text-red-400'}`}>
                    {money(data.totals.balance)}
                  </p>
                </div>
              </div>

              <div className="brand-panel rounded-2xl border border-white/6 p-3">
                {chartKind === 'pie' ? (
                  <div className="flex justify-center">
                    <PieChartSvg values={currentMetricItems.map((item) => ({ value: item.value, color: item.color }))} />
                  </div>
                ) : chartKind === 'line' ? (
                  <LineChartSvg values={lineValues} />
                ) : (
                  <BarChartSvg
                    values={currentMetricItems.map((item) => ({
                      label: item.label,
                      value: item.value,
                      color: item.color,
                    }))}
                  />
                )}
              </div>

              <div className="mt-4 space-y-2">
                {currentMetricItems.length === 0 ? (
                  <p className="py-8 text-center text-sm text-zinc-400">Sem dados para essa visualização.</p>
                ) : (
                  currentMetricItems.map((item, index) => {
                    const total = currentMetricItems.reduce((sum, current) => sum + current.value, 0);
                    const percent = total > 0 ? (item.value / total) * 100 : 0;

                    if (item.onClick) {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={item.onClick}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/6"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: resolveColor(index, item.color) }}
                            />
                            <span className="truncate text-sm text-zinc-100">{item.label}</span>
                          </span>
                          <span className="text-right">
                            <p className="text-sm font-semibold text-zinc-100">{money(item.value)}</p>
                            <p className="text-xs text-zinc-500">{percent.toFixed(1)}%</p>
                          </span>
                        </button>
                      );
                    }

                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: resolveColor(index, item.color) }}
                          />
                          <span className="truncate text-sm text-zinc-100">{item.label}</span>
                        </span>
                        <span className="text-right">
                          <p className="text-sm font-semibold text-zinc-100">{money(item.value)}</p>
                          <p className="text-xs text-zinc-500">{percent.toFixed(1)}%</p>
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-1 text-xs text-zinc-500">
          <span>Toque em um item da legenda para abrir transações já filtradas.</span>
        </div>

        <Link
          href="/transactions"
          className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/6"
        >
          Ir para transações
        </Link>
      </div>
    </PageShell>
  );
}
