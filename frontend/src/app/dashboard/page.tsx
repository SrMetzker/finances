'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { useTransactions } from '@/hooks/use-transactions-api';
import { useAccounts } from '@/hooks/use-accounts-api';
import { useCards } from '@/hooks/use-cards-api';
import { alphaHex, getIconComponent } from '@/lib/visual-options';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/services/auth.context';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  CreditCard,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const [showValues, setShowValues] = useState(true);
  const { transactions } = useTransactions();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { cards } = useCards();
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

  return (
    <PageShell
      title={
        <label className="block w-full max-w-56">
          <span className="sr-only">Selecionar workspace</span>
          <select
            value={workspaceId ?? ''}
            onChange={(event) => setWorkspaceId(event.target.value)}
            className="w-full appearance-none rounded-full border border-zinc-700 bg-[#1e2235] px-4 py-2 text-center text-sm font-semibold text-zinc-100 outline-none transition focus:border-zinc-500"
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
      <div className="mx-4 mb-4 rounded-2xl bg-[#1e2235] p-4">
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
              <button className="text-purple-400 font-light" aria-label="Adicionar">
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

      {/* cards section */}
      <div className="mx-4 mb-4 rounded-2xl bg-[#1e2235] p-4">
        <h3 className="font-semibold text-base mb-3">Cartões de crédito</h3>
        {cards.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CreditCard size={44} className="text-zinc-600 mb-3" />
            <p className="text-sm font-semibold text-zinc-200 leading-snug">
              Ops! Você ainda não tem nenhum<br />cartão de crédito cadastrado.
            </p>
            <p className="text-xs text-zinc-500 mt-1">Melhore seu controle financeiro agora!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <div key={card.id} className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{card.name}</p>
                  <p className="text-xs text-zinc-400">Limite: {money(Number(card.limit))}</p>
                </div>
                <p className="text-sm font-semibold">{card.closingDay}º</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
