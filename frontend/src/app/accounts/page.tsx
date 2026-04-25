'use client';

import { PageShell } from '@/components/page-shell';
import { IconColorPicker } from '@/components/icon-color-picker';
import { useAccounts } from '@/hooks/use-accounts-api';
import { useMonthFilter } from '@/hooks/use-month-filter';
import { useTransactions } from '@/hooks/use-transactions-api';
import { useCategories } from '@/hooks/use-categories-api';
import { formatCurrency } from '@/lib/currency';
import {
  DEFAULT_ACCOUNT_COLOR,
  DEFAULT_ACCOUNT_ICON,
  alphaHex,
  getIconComponent,
  type VisualIconName,
} from '@/lib/visual-options';
import { ChevronLeft, ChevronRight, MoreVertical, Plus, X, Edit } from 'lucide-react';
import { useAuth } from '@/services/auth.context';
import { useState } from 'react';

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

export default function AccountsPage() {
  const { accounts, createAccount, updateAccount } = useAccounts();
  const { month, setMonth, parsed } = useMonthFilter(new Date());
  const { transactions } = useTransactions(parsed.month, parsed.year);
  const { categories } = useCategories();
  const { workspace } = useAuth();
  const { createTransaction } = useTransactions();
    const money = (value: number) => formatCurrency(value, workspace?.currency ?? 'EUR');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [icon, setIcon] = useState<VisualIconName>(DEFAULT_ACCOUNT_ICON);
  const [color, setColor] = useState(DEFAULT_ACCOUNT_COLOR);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editIcon, setEditIcon] = useState<VisualIconName>(DEFAULT_ACCOUNT_ICON);
  const [editColor, setEditColor] = useState(DEFAULT_ACCOUNT_COLOR);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const pendingByAccount = transactions.reduce<Record<string, number>>((acc, tx) => {
    if (tx.isPaid) {
      return acc;
    }

    const amount = Number(tx.amount);

    if (tx.type === 'ENTRADA') {
      acc[tx.accountId] = (acc[tx.accountId] ?? 0) + amount;
      return acc;
    }

    if (tx.type === 'SAIDA') {
      acc[tx.accountId] = (acc[tx.accountId] ?? 0) - amount;
      return acc;
    }

    acc[tx.accountId] = (acc[tx.accountId] ?? 0) - amount;
    if (tx.destinationAccountId) {
      acc[tx.destinationAccountId] = (acc[tx.destinationAccountId] ?? 0) + amount;
    }

    return acc;
  }, {});

  const totalCurrent = accounts.reduce((sum, account) => sum + Number(account.currentBalance), 0);
  const totalProjected = accounts.reduce(
    (sum, account) => sum + Number(account.currentBalance) + (pendingByAccount[account.id] ?? 0),
    0,
  );

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

  function openCreateModal() {
    setName('');
    setInitialBalance('0');
    setIcon(DEFAULT_ACCOUNT_ICON);
    setColor(DEFAULT_ACCOUNT_COLOR);
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    if (isSaving) return;
    setIsCreateOpen(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const parsedBalance = Number(initialBalance);
    if (!name.trim() || Number.isNaN(parsedBalance)) {
      return;
    }

    try {
      setIsSaving(true);
      await createAccount({
        name: name.trim(),
        initialBalance: parsedBalance,
        icon,
        color,
      });
      setIsCreateOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  function openEditModal(
    accountId: string,
    accountName: string,
    accountBalance: number,
    accountIcon: string,
    accountColor: string,
  ) {
    setEditingAccountId(accountId);
    setEditName(accountName);
    setEditBalance(String(accountBalance));
    setEditIcon((accountIcon as VisualIconName) || DEFAULT_ACCOUNT_ICON);
    setEditColor(accountColor || DEFAULT_ACCOUNT_COLOR);
    setIsEditOpen(true);
    setOpenDropdownId(null);
  }

  function closeEditModal() {
    if (isSaving) return;
    setIsEditOpen(false);
    setEditingAccountId(null);
  }

  async function handleEditAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAccountId) return;

    const newBalance = Number(editBalance);
    const oldBalance = accounts.find((a) => a.id === editingAccountId)?.currentBalance ?? 0;
    const trimmedName = editName.trim();

    if (!trimmedName || Number.isNaN(newBalance)) {
      return;
    }

    try {
      setIsSaving(true);

      await updateAccount(editingAccountId, {
        name: trimmedName,
        icon: editIcon,
        color: editColor,
      });

      const difference = newBalance - oldBalance;

      // Se houve diferença, criar transação automática
      if (Math.abs(difference) > 0.01) {
        const saídaCategory = categories.find((c) => c.type === 'SAIDA');
        const entradaCategory = categories.find((c) => c.type === 'ENTRADA');
        const transactionCategory = difference > 0 ? entradaCategory : saídaCategory;

        if (transactionCategory) {
          await createTransaction({
            amount: Math.abs(difference),
            type: difference > 0 ? 'ENTRADA' : 'SAIDA',
            date: new Date().toISOString().slice(0, 10),
            description: `Ajuste de saldo: ${trimmedName}`,
            accountId: editingAccountId,
            categoryId: transactionCategory.id,
            isPaid: true,
          });
        }
      }

      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell title="Contas" onHeaderAdd={openCreateModal}>
      <div className="px-4 py-3">
        <div className="mb-3 flex items-center justify-between px-2">
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

        <div className="brand-surface rounded-[1.75rem] px-4 py-4">
          <div className="mb-4 grid grid-cols-2 gap-3 border-b border-white/8 pb-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-300">Saldo atual</p>
              <p className="font-bold text-green-400">{money(totalCurrent)}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs font-medium text-zinc-300">Saldo previsto</p>
              <p className="font-bold text-green-400">{money(totalProjected)}</p>
            </div>
          </div>

          <div className="divide-y divide-white/6">
            {accounts.map((account) => {
              const current = Number(account.currentBalance);
              const projected = current + (pendingByAccount[account.id] ?? 0);

              return (
                <div key={account.id} className="py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full border"
                        style={{
                          backgroundColor: alphaHex(account.color, '22'),
                          borderColor: alphaHex(account.color, '66'),
                        }}
                      >
                        {(() => {
                          const AccountIcon = getIconComponent(account.icon);
                          return <AccountIcon size={16} style={{ color: account.color }} />;
                        })()}
                      </div>
                      <p className="font-medium text-zinc-100">{account.name}</p>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenDropdownId(openDropdownId === account.id ? null : account.id)}
                        className="rounded-full p-2 text-zinc-300 transition-colors hover:bg-white/6"
                        aria-label={`Ações da conta ${account.name}`}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {openDropdownId === account.id && (
                        <div className="brand-surface absolute right-0 top-full z-50 mt-1 min-w-40 rounded-2xl p-1.5 shadow-lg">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                account.id,
                                account.name,
                                Number(account.currentBalance),
                                account.icon,
                                account.color,
                              )
                            }
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-lime-300 hover:bg-white/6"
                          >
                            <Edit size={14} />
                            Editar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pl-[3rem]">
                    <div>
                      <p className="text-xs text-zinc-200">Saldo atual</p>
                      <p className="text-xs text-zinc-400">Saldo previsto</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">{money(current)}</p>
                      <p className="text-zinc-500">{money(projected)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isEditOpen && editingAccountId && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={closeEditModal}
            aria-label="Fechar modal"
          />
          <div className="brand-panel absolute inset-x-0 bottom-0 rounded-t-3xl border border-white/6 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Editar conta</h2>
              <button type="button" onClick={closeEditModal} className="text-zinc-400" aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditAccount} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-400">Nome</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 outline-none focus:border-lime-300"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-zinc-400">Saldo</span>
                <input
                  type="number"
                  step="0.01"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 outline-none focus:border-lime-300"
                  required
                />
              </label>

              <IconColorPicker
                selectedIcon={editIcon}
                selectedColor={editColor}
                onChangeIcon={setEditIcon}
                onChangeColor={setEditColor}
              />

              <p className="text-xs text-zinc-400">
                Ao alterar o saldo, uma transação de ajuste será criada automaticamente.
              </p>

              <button
                type="submit"
                disabled={isSaving}
                className="brand-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 font-semibold disabled:opacity-60"
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={closeCreateModal}
            aria-label="Fechar modal"
          />
          <div className="brand-panel absolute inset-x-0 bottom-0 rounded-t-3xl border border-white/6 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nova conta</h2>
              <button type="button" onClick={closeCreateModal} className="text-zinc-400" aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-400">Nome</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 outline-none focus:border-lime-300"
                  placeholder="Ex.: Conta digital"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-zinc-400">Saldo inicial</span>
                <input
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 outline-none focus:border-lime-300"
                  required
                />
              </label>

              <IconColorPicker
                selectedIcon={icon}
                selectedColor={color}
                onChangeIcon={setIcon}
                onChangeColor={setColor}
              />

              <button
                type="submit"
                disabled={isSaving}
                className="brand-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 font-semibold disabled:opacity-60"
              >
                <Plus size={16} />
                {isSaving ? 'Criando...' : 'Criar conta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
