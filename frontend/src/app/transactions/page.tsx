'use client';

import { MobileListItem } from '@/components/mobile-list-item';
import { PageShell } from '@/components/page-shell';
import { useMonthFilter } from '@/hooks/use-month-filter';
import { useTransactions } from '@/hooks/use-transactions-api';
import { useAccounts } from '@/hooks/use-accounts-api';
import { alphaHex, getIconComponent } from '@/lib/visual-options';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Wallet,
} from 'lucide-react';

const eur = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' });

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const TYPE_COLOR: Record<string, string> = {
  ENTRADA: 'text-green-400',
  SAIDA: 'text-red-400',
  TRANSFERENCIA: 'text-blue-400',
};

export default function TransactionsPage() {
  const { month, setMonth, parsed } = useMonthFilter(new Date('2026-04-01'));
  const { transactions } = useTransactions(parsed.month, parsed.year);
  const { accounts } = useAccounts();

  const filtered = transactions.filter((tx) => {
    const [y, m] = tx.date.split('-');
    return Number(y) === parsed.year && Number(m) === parsed.month;
  });

  const totalBalance = accounts.reduce((s, a) => s + a.currentBalance, 0);
  const monthlyBalance = filtered.reduce((s, tx) => {
    const amount = Number(tx.amount);
    if (tx.type === 'ENTRADA') return s + amount;
    if (tx.type === 'SAIDA') return s - amount;
    return s;
  }, 0);

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
    <PageShell title="Transações">
      {/* month navigator */}
      <div className="flex items-center justify-between px-8 py-3">
        <button onClick={prevMonth} className="text-zinc-400">
          <ChevronLeft size={22} />
        </button>
        <span className="font-semibold">{MONTH_NAMES[parsed.month - 1]}</span>
        <button onClick={nextMonth} className="text-zinc-400">
          <ChevronRight size={22} />
        </button>
      </div>

      {/* balance card */}
      <div className="mx-4 mb-4 rounded-2xl bg-[#1e2235] p-4 flex justify-around items-center">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-green-400" />
          <div>
            <p className="text-xs text-zinc-400">Saldo atual</p>
            <p className="font-bold text-green-400">{eur.format(totalBalance)}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-zinc-700" />
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-zinc-400" />
          <div>
            <p className="text-xs text-zinc-400">Balanço mensal</p>
            <p className={`font-bold ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {eur.format(monthlyBalance)}
            </p>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        /* empty state */
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-48 h-48 rounded-full bg-white/5 flex items-center justify-center mb-6">
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
        <ul className="mx-4 space-y-2">
          {filtered.map((tx) => {
            const CategoryIcon = getIconComponent(tx.category?.icon);
            const categoryColor = tx.category?.color ?? '#6366F1';

            return (
              <MobileListItem
                key={tx.id}
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
                subtitle={`${tx.category?.name ?? 'Sem categoria'} · ${new Date(tx.date).toLocaleDateString('pt-BR')}`}
                value={
                  <>
                    {tx.type === 'SAIDA' ? '-' : '+'}
                    {eur.format(tx.amount)}
                  </>
                }
                valueClassName={TYPE_COLOR[tx.type]}
                trailing={tx.isPaid ? <p className="text-xs text-zinc-500">Pago</p> : undefined}
              />
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
