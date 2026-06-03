'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MobileListItem } from '@/components/mobile-list-item';
import { PageShell } from '@/components/page-shell';
import { TransactionDetailsModal } from '@/components/transaction-details-modal';
import { useMonthFilter } from '@/hooks/use-month-filter';
import { useTransactions } from '@/hooks/use-transactions-api';
import { useAccounts } from '@/hooks/use-accounts-api';
import { useCategories } from '@/hooks/use-categories-api';
import { formatCurrency } from '@/lib/currency';
import { alphaHex, getIconComponent } from '@/lib/visual-options';
import { useAuth } from '@/services/auth.context';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Wallet,
  SlidersHorizontal,
  X,
  Plus,
} from 'lucide-react';

type ActiveFilters = {
  categoryRootIds: string[];
  categorySubIds: string[];
  accountIds: string[];
  dateFrom: string;
  dateTo: string;
  useDateRange: boolean;
};

function hasActiveFilters(f: ActiveFilters) {
  return (
    f.categoryRootIds.length > 0 ||
    f.accountIds.length > 0 ||
    f.useDateRange
  );
}

const EMPTY_FILTERS: ActiveFilters = {
  categoryRootIds: [],
  categorySubIds: [],
  accountIds: [],
  dateFrom: '',
  dateTo: '',
  useDateRange: false,
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const TYPE_COLOR: Record<string, string> = {
  ENTRADA: 'text-green-400',
  SAIDA: 'text-red-400',
  TRANSFERENCIA: 'text-blue-400',
};

function formatDayGroupLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const safeDate = new Date(year, (month ?? 1) - 1, day ?? 1);

  if (Number.isNaN(safeDate.getTime())) {
    return dateKey;
  }

  const weekdayRaw = safeDate.toLocaleDateString('pt-BR', { weekday: 'long' });
  const weekday = weekdayRaw.replace('-feira', '');
  const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return `${weekdayCapitalized}, ${String(day).padStart(2, '0')}`;
}

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const lastHydratedQueryRef = useRef('');
  const { month, setMonth, parsed } = useMonthFilter(new Date());
  const { transactions, updateTransaction, deleteTransaction } = useTransactions(parsed.month, parsed.year);
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { workspace } = useAuth();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [draft, setDraft] = useState<ActiveFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<ActiveFilters>(EMPTY_FILTERS);

  const subcategoriesByParent = useMemo(() => {
    const map = new Map<string, typeof categories>();
    for (const cat of categories) {
      if (!cat.parentCategoryId) continue;
      const existing = map.get(cat.parentCategoryId) ?? [];
      map.set(cat.parentCategoryId, [...existing, cat]);
    }
    return map;
  }, [categories]);

  const money = (value: number) => formatCurrency(value, workspace?.currency ?? 'EUR');

  function openFilterPanel() {
    setDraft(applied);
    setShowFilterPanel(true);
  }

  function closeFilterPanel() {
    setShowFilterPanel(false);
  }

  function applyFilters() {
    setApplied(draft);
    setShowFilterPanel(false);
  }

  function clearFilters() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setShowFilterPanel(false);
  }

  function toggleRootCategory(rootId: string) {
    setDraft((prev) => {
      const nextRootIds = toggleId(prev.categoryRootIds, rootId);
      // when deselecting a root, remove all its subcategories from subIds too
      const subsOfRoot = subcategoriesByParent.get(rootId)?.map((s) => s.id) ?? [];
      const nextSubIds = nextRootIds.includes(rootId)
        ? prev.categorySubIds
        : prev.categorySubIds.filter((id) => !subsOfRoot.includes(id));
      return { ...prev, categoryRootIds: nextRootIds, categorySubIds: nextSubIds };
    });
  }

  function toggleSubCategory(subId: string) {
    setDraft((prev) => ({
      ...prev,
      categorySubIds: toggleId(prev.categorySubIds, subId),
    }));
  }

  function toggleId(ids: string[], id: string) {
    return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  }

  const filtered = useMemo(() => {
    const base = transactions.filter((tx) => {
      const [y, m] = tx.date.split('-');
      return Number(y) === parsed.year && Number(m) === parsed.month;
    });

    return base.filter((tx) => {
      if (applied.categoryRootIds.length > 0) {
        // resolve the root of this transaction's category
        const txRootId = tx.category?.parentCategoryId ?? tx.categoryId;
        if (!applied.categoryRootIds.includes(txRootId)) return false;
        // if specific subcategories are selected for this root, narrow down
        const pinnedSubsOfRoot = applied.categorySubIds.filter(
          (subId) =>
            categories.find((c) => c.id === subId)?.parentCategoryId === txRootId,
        );
        if (pinnedSubsOfRoot.length > 0) {
          if (!pinnedSubsOfRoot.includes(tx.categoryId)) return false;
        }
      }
      if (applied.accountIds.length > 0) {
        const matchesSourceAccount = applied.accountIds.includes(tx.accountId);
        const matchesDestinationAccount =
          tx.type === 'TRANSFERENCIA' &&
          !!tx.destinationAccountId &&
          applied.accountIds.includes(tx.destinationAccountId);

        if (!matchesSourceAccount && !matchesDestinationAccount) {
          return false;
        }
      }
      if (applied.useDateRange) {
        const txDate = tx.date.slice(0, 10);
        if (applied.dateFrom && txDate < applied.dateFrom) return false;
        if (applied.dateTo && txDate > applied.dateTo) return false;
      }
      return true;
    });
  }, [transactions, parsed.year, parsed.month, applied]);

  const selectedTransaction = useMemo(
    () => filtered.find((transaction) => transaction.id === selectedTransactionId) ?? null,
    [filtered, selectedTransactionId],
  );

  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, typeof filtered>();

    for (const tx of filtered) {
      const dateKey = tx.date.slice(0, 10);
      const current = groups.get(dateKey) ?? [];
      groups.set(dateKey, [...current, tx]);
    }

    return [...groups.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([dateKey, dayTransactions]) => ({
        dateKey,
        label: formatDayGroupLabel(dateKey),
        transactions: [...dayTransactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      }));
  }, [filtered]);

  const totalBalance = accounts.reduce((s, a) => s + a.currentBalance, 0);
  const monthlyBalance = filtered.reduce((s, tx) => {
    const amount = Number(tx.amount);
    if (tx.type === 'ENTRADA') return s + amount;
    if (tx.type === 'SAIDA') return s - amount;
    return s;
  }, 0);

  const isFiltered = hasActiveFilters(applied);

  useEffect(() => {
    const monthParam = searchParams.get('month');
    const rootParam = searchParams.get('categoryRootIds');
    const subParam = searchParams.get('categorySubIds');
    const accountParam = searchParams.get('accountIds');
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    const useDateRangeParam = searchParams.get('useDateRange');

    const currentQueryKey = [
      monthParam ?? '',
      rootParam ?? '',
      subParam ?? '',
      accountParam ?? '',
      dateFromParam ?? '',
      dateToParam ?? '',
      useDateRangeParam ?? '',
    ].join('|');
    if (lastHydratedQueryRef.current === currentQueryKey) {
      return;
    }
    lastHydratedQueryRef.current = currentQueryKey;

    if (monthParam) {
      setMonth(monthParam);
    }

    const rootIds = rootParam
      ? rootParam.split(',').map((id) => id.trim()).filter(Boolean)
      : [];
    const subIds = subParam
      ? subParam.split(',').map((id) => id.trim()).filter(Boolean)
      : [];
    const accountIds = accountParam
      ? accountParam.split(',').map((id) => id.trim()).filter(Boolean)
      : [];
    const useDateRange = useDateRangeParam === '1' || useDateRangeParam === 'true';

    if (
      monthParam ||
      rootIds.length > 0 ||
      subIds.length > 0 ||
      accountIds.length > 0 ||
      dateFromParam ||
      dateToParam ||
      useDateRange
    ) {
      const hydrated: ActiveFilters = {
        ...EMPTY_FILTERS,
        categoryRootIds: rootIds,
        categorySubIds: subIds,
        accountIds,
        dateFrom: dateFromParam ?? '',
        dateTo: dateToParam ?? '',
        useDateRange,
      };
      setDraft(hydrated);
      setApplied(hydrated);
    }
  }, [searchParams, setMonth]);

  function prevMonth() {
    const d = new Date(`${month}-01`);
    d.setMonth(d.getMonth() - 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  function nextMonth() {
    const d = new Date(`${month}-01`);
    d.setMonth(d.getMonth() + 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return (
    <PageShell
      title="Transações"
      headerRight={
        <button
          type="button"
          onClick={openFilterPanel}
          aria-label="Filtrar transações"
          className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-[1.04] ${
            isFiltered
              ? 'brand-gradient brand-glow'
              : 'border border-white/10 bg-white/5 text-zinc-300'
          }`}
        >
          <SlidersHorizontal size={17} />
          {isFiltered && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-lime-300 ring-2 ring-[var(--bg)]" />
          )}
        </button>
      }
    >
      {/* month navigator */}
      <div className="flex items-center justify-between px-8 py-3">
        <button onClick={prevMonth} className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-white/6">
          <ChevronLeft size={22} />
        </button>
        <span className="font-semibold">{MONTH_NAMES[parsed.month - 1]}</span>
        <button onClick={nextMonth} className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-white/6">
          <ChevronRight size={22} />
        </button>
      </div>

      {/* balance card */}
      <div className="brand-surface mx-4 mb-4 flex items-center justify-around rounded-[1.75rem] p-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-green-400" />
          <div>
            <p className="text-xs text-zinc-400">Saldo atual</p>
            <p className="font-bold text-green-400">{money(totalBalance)}</p>
          </div>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-zinc-400" />
          <div>
            <p className="text-xs text-zinc-400">Balanço mensal</p>
            <p className={`font-bold ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {money(monthlyBalance)}
            </p>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        /* empty state */
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="brand-surface-soft mb-6 flex h-48 w-48 items-center justify-center rounded-full">
            <span className="text-7xl">🔍</span>
          </div>
          <p className="font-bold text-lg leading-snug">
            Ops! Você não possui<br />transações registradas.
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            Para criar um novo item, clique no botão (+)
          </p>
        </div>
      ) : (
        <div className="mx-4 space-y-5">
          {groupedTransactions.map((group) => (
            <section key={group.dateKey}>
              <h3 className="mb-2 px-1 text-xl font-semibold tracking-tight text-zinc-100">{group.label}</h3>
              <ul className="space-y-2">
                {group.transactions.map((tx) => {
                  const CategoryIcon = getIconComponent(tx.category?.icon);
                  const categoryColor = tx.category?.color ?? '#6366F1';
                  const accountName =
                    tx.account?.name ?? accounts.find((account) => account.id === tx.accountId)?.name ?? 'Sem conta';

                  return (
                    <MobileListItem
                      key={tx.id}
                      onClick={() => setSelectedTransactionId(tx.id)}
                      leading={
                        <div
                          className="h-10 w-10 rounded-full border flex items-center justify-center"
                          style={{
                            backgroundColor: alphaHex(categoryColor, '22'),
                            borderColor: alphaHex(categoryColor, '66'),
                          }}
                        >
                          <CategoryIcon size={18} style={{ color: categoryColor }} />
                        </div>
                      }
                      title={tx.description}
                      subtitle={`${tx.category?.name ?? 'Sem categoria'} | ${accountName}`}
                      value={
                        <>
                          {tx.type === 'SAIDA' ? '-' : '+'}
                          {money(tx.amount)}
                        </>
                      }
                      valueClassName={TYPE_COLOR[tx.type]}
                      trailing={tx.isPaid ? <p className="text-xs text-zinc-500">Pago</p> : undefined}
                    />
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {selectedTransaction && (
        <TransactionDetailsModal
          key={selectedTransaction.id}
          transaction={selectedTransaction}
          isOpen
          onClose={() => setSelectedTransactionId(null)}
          onSave={async (id, input) => {
            await updateTransaction(id, input);
          }}
          onDelete={async (id) => {
            await deleteTransaction(id);
          }}
        />
      )}

      {/* filter panel */}
      {showFilterPanel && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={closeFilterPanel}
            aria-label="Fechar filtro"
          />
          <div className="brand-panel absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl border border-white/6 p-6 shadow-2xl">
            {/* header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtrar</h2>
              <button type="button" onClick={closeFilterPanel} className="text-zinc-400" aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* categories */}
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-300">Categorias</p>
                <div className="space-y-2">
                  {categories
                    .filter((c) => !c.parentCategoryId)
                    .map((cat) => {
                      const rootSelected = draft.categoryRootIds.includes(cat.id);
                      const subs = subcategoriesByParent.get(cat.id) ?? [];
                      return (
                        <div key={cat.id}>
                          {/* root chip */}
                          <button
                            type="button"
                            onClick={() => toggleRootCategory(cat.id)}
                            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition"
                            style={
                              rootSelected
                                ? {
                                    backgroundColor: alphaHex(cat.color, '33'),
                                    borderColor: alphaHex(cat.color, '88'),
                                    color: cat.color,
                                  }
                                : { borderColor: 'rgba(255,255,255,0.10)', color: '#a1a1aa' }
                            }
                          >
                            {(() => {
                              const CatIcon = getIconComponent(cat.icon);
                              return <CatIcon size={12} />;
                            })()}
                            {cat.name}
                          </button>

                          {/* subcategory chips — only when root is selected */}
                          {rootSelected && subs.length > 0 && (
                            <div className="ml-3 mt-2 flex flex-wrap gap-1.5">
                              <span className="self-center text-[10px] text-zinc-500">Subcategorias:</span>
                              {subs.map((sub) => {
                                const subSelected = draft.categorySubIds.includes(sub.id);
                                return (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => toggleSubCategory(sub.id)}
                                    className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition"
                                    style={
                                      subSelected
                                        ? {
                                            backgroundColor: alphaHex(cat.color, '22'),
                                            borderColor: alphaHex(cat.color, '77'),
                                            color: cat.color,
                                          }
                                        : { borderColor: 'rgba(255,255,255,0.08)', color: '#71717a' }
                                    }
                                  >
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{ backgroundColor: subSelected ? cat.color : '#52525b' }}
                                    />
                                    {sub.name}
                                  </button>
                                );
                              })}
                              {draft.categorySubIds.some(
                                (id) => categories.find((c) => c.id === id)?.parentCategoryId === cat.id,
                              ) && (
                                <span className="self-center text-[10px] text-zinc-500">
                                  (sem seleção = todas)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* accounts */}
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-300">Contas</p>
                <div className="flex flex-wrap gap-2">
                  {accounts.map((acc) => {
                    const selected = draft.accountIds.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            accountIds: toggleId(prev.accountIds, acc.id),
                          }))
                        }
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition"
                        style={
                          selected
                            ? {
                                backgroundColor: alphaHex(acc.color, '33'),
                                borderColor: alphaHex(acc.color, '88'),
                                color: acc.color,
                              }
                            : { borderColor: 'rgba(255,255,255,0.10)', color: '#a1a1aa' }
                        }
                      >
                        {(() => {
                          const AccIcon = getIconComponent(acc.icon);
                          return <AccIcon size={12} />;
                        })()}
                        {acc.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* date range */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-300">Período</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.useDateRange}
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, useDateRange: !prev.useDateRange }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      draft.useDateRange ? 'brand-gradient' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        draft.useDateRange ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {draft.useDateRange && (
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-400">Data inicial</span>
                      <input
                        type="date"
                        value={draft.dateFrom}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, dateFrom: e.target.value }))
                        }
                        className="brand-panel w-full rounded-xl border border-white/8 px-3 py-2 text-sm outline-none focus:border-lime-300"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-zinc-400">Data final</span>
                      <input
                        type="date"
                        value={draft.dateTo}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, dateTo: e.target.value }))
                        }
                        className="brand-panel w-full rounded-xl border border-white/8 px-3 py-2 text-sm outline-none focus:border-lime-300"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* actions */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/6"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="brand-gradient flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold"
              >
                <Plus size={14} />
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
