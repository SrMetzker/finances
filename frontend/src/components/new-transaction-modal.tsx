'use client';

import {
  CheckCircle,
  Calendar,
  Mic,
  ImagePlus,
  Pin,
  RefreshCw,
  PenLine,
  ChevronDown,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { alphaHex, getIconComponent } from '@/lib/visual-options';
import { useEffect, useMemo, useState } from 'react';
import { useAccounts } from '@/hooks/use-accounts-api';
import { useCategories } from '@/hooks/use-categories-api';
import type { TransactionType, CreateTransactionDto } from '@/services/api.types';

const eur = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' });

const TYPE_TEXT: Record<TransactionType, { title: string; amountLabel: string }> = {
  ENTRADA: { title: 'Nova receita', amountLabel: 'Valor da receita' },
  SAIDA: { title: 'Nova despesa', amountLabel: 'Valor da despesa' },
  TRANSFERENCIA: { title: 'Nova transferencia', amountLabel: 'Valor da transferencia' },
};

function normalizeCategoryName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function NewTransactionModal({
  isOpen,
  type,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  type: TransactionType;
  onClose: () => void;
  onSubmit: (payload: CreateTransactionDto) => Promise<void> | void;
}) {
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [amount, setAmount] = useState('');
  const [paid, setPaid] = useState(true);
  const [dateOption, setDateOption] = useState<'today' | 'yesterday' | 'other'>('today');
  const [fixedExpense, setFixedExpense] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [accountPickerTarget, setAccountPickerTarget] = useState<'source' | 'destination' | null>(
    null,
  );

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );

  const defaultCategoryId = useMemo(() => {
    if (filteredCategories.length === 0) {
      return '';
    }

    if (type === 'TRANSFERENCIA') {
      const transferCategory = filteredCategories.find(
        (category) => normalizeCategoryName(category.name) === 'transferencia',
      );

      if (transferCategory) {
        return transferCategory.id;
      }
    }

    return filteredCategories[0].id;
  }, [filteredCategories, type]);

  useEffect(() => {
    if (!isOpen) return;

    // Set default account and category
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
    if (type === 'TRANSFERENCIA' && accounts.length > 1 && !destinationAccountId) {
      setDestinationAccountId(accounts[1].id);
    }
    if (defaultCategoryId && categoryId !== defaultCategoryId) {
      setCategoryId(defaultCategoryId);
    }

    setAmount('');
    setPaid(true);
    setDateOption('today');
    setFixedExpense(false);
    setRepeat(false);
    setDescription('');
  }, [
    isOpen,
    type,
    accounts,
    defaultCategoryId,
    accountId,
    destinationAccountId,
    categoryId,
  ]);

  useEffect(() => {
    if (type !== 'TRANSFERENCIA') {
      setDestinationAccountId('');
      return;
    }

    if (destinationAccountId === accountId) {
      const nextDestinationAccount = accounts.find((account) => account.id !== accountId);
      setDestinationAccountId(nextDestinationAccount?.id ?? '');
    }
  }, [type, accountId, destinationAccountId, accounts]);

  if (!isOpen) {
    return null;
  }

  const info = TYPE_TEXT[type];
  const selectedCategory = filteredCategories.find((c) => c.id === categoryId);
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const availableDestinationAccounts = accounts.filter((account) => account.id !== accountId);
  const selectedDestinationAccount = availableDestinationAccounts.find(
    (account) => account.id === destinationAccountId,
  );
  const SelectedCategoryIcon = getIconComponent(selectedCategory?.icon);
  const SelectedAccountIcon = getIconComponent(selectedAccount?.icon);
  const SelectedDestinationAccountIcon = getIconComponent(selectedDestinationAccount?.icon);
  const accountPickerOptions =
    accountPickerTarget === 'destination' ? availableDestinationAccounts : accounts;
  const accountPickerTitle =
    accountPickerTarget === 'destination' ? 'Selecione a conta destino' : 'Selecione uma conta';

  function handleAccountSelection(selectedId: string) {
    if (accountPickerTarget === 'destination') {
      setDestinationAccountId(selectedId);
    } else {
      setAccountId(selectedId);
    }

    setAccountPickerTarget(null);
  }

  function resolveDate() {
    const base = new Date();
    if (dateOption === 'yesterday') {
      base.setDate(base.getDate() - 1);
    }
    return base.toISOString().slice(0, 10);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return;
    }

    if (!selectedAccount || !selectedCategory) {
      return;
    }

    if (type === 'TRANSFERENCIA' && !selectedDestinationAccount) {
      return;
    }

    const payload: CreateTransactionDto = {
      amount: numericAmount,
      type,
      date: dateOption === 'other' ? todayIsoDate() : resolveDate(),
      description: description.trim() || info.title,
      isPaid: paid,
      isRecurring: repeat,
      accountId: selectedAccount.id,
      categoryId: selectedCategory.id,
    };

    // Add destination account if transfer
    if (type === 'TRANSFERENCIA' && selectedDestinationAccount) {
      payload.destinationAccountId = selectedDestinationAccount.id;
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error('Erro ao criar transação:', error);
    }
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/80"
      />

      <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-[#161825]">
        <div className="sticky top-0 z-10 border-b border-zinc-800 bg-[#161825] px-5 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{info.title}</h2>
          <button type="button" onClick={onClose} className="text-zinc-400" aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pb-24">
          <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-800">
            <div>
              <p className="text-xs text-zinc-400 mb-1">{info.amountLabel}</p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="text-4xl font-bold bg-transparent border-none outline-none w-44 text-white placeholder-white"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">
                {amount ? eur.format(Number(amount) || 0) : eur.format(0)}
              </p>
            </div>
            <ChevronDown size={20} className="text-zinc-400" />
          </div>

          <div className="divide-y divide-zinc-800/60">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3 text-zinc-200">
                <CheckCircle size={20} className="text-zinc-400" />
                <span>Pago</span>
              </div>
              <button
                type="button"
                onClick={() => setPaid(!paid)}
                className={`w-12 h-6 rounded-full transition-colors relative ${paid ? 'bg-red-500' : 'bg-zinc-700'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${paid ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <Calendar size={20} className="text-zinc-400 flex-shrink-0" />
              <div className="flex gap-2 ml-3 flex-1">
                {(['today', 'yesterday', 'other'] as const).map((opt) => {
                  const labels = { today: 'Hoje', yesterday: 'Ontem', other: 'Outros...' };
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDateOption(opt)}
                      className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                        dateOption === opt ? 'bg-red-500 text-white' : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {labels[opt]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center px-5 py-4 gap-3">
              <Mic size={20} className="text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição"
                className="flex-1 bg-transparent outline-none text-zinc-200 placeholder-zinc-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-800/20"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: alphaHex(selectedCategory?.color ?? '#6366F1', '22'),
                    borderColor: alphaHex(selectedCategory?.color ?? '#6366F1', '66'),
                  }}
                >
                  <SelectedCategoryIcon size={15} style={{ color: selectedCategory?.color ?? '#6366F1' }} />
                </span>
                <span className="rounded-full border border-zinc-600 px-3 py-1 text-sm text-zinc-200">
                  {selectedCategory?.name ?? 'Categoria'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountPickerTarget('source')}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-800/20"
              aria-label="Selecionar conta"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: alphaHex(selectedAccount?.color ?? '#EF4444', '22'),
                    borderColor: alphaHex(selectedAccount?.color ?? '#EF4444', '66'),
                  }}
                >
                  <SelectedAccountIcon size={15} style={{ color: selectedAccount?.color ?? '#EF4444' }} />
                </span>
                <span className="flex items-center gap-2 rounded-full border border-zinc-600 px-3 py-1 text-sm text-zinc-200">
                  {selectedAccount?.name ?? 'Conta'}
                </span>
              </div>
            </button>

            {type === 'TRANSFERENCIA' && (
              <button
                type="button"
                onClick={() => setAccountPickerTarget('destination')}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-800/20"
                aria-label="Selecionar conta destino"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border"
                    style={{
                      backgroundColor: alphaHex(selectedDestinationAccount?.color ?? '#10B981', '22'),
                      borderColor: alphaHex(selectedDestinationAccount?.color ?? '#10B981', '66'),
                    }}
                  >
                    <SelectedDestinationAccountIcon
                      size={15}
                      style={{ color: selectedDestinationAccount?.color ?? '#10B981' }}
                    />
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-zinc-600 px-3 py-1 text-sm text-zinc-200">
                    {selectedDestinationAccount?.name ?? 'Conta destino'}
                  </span>
                </div>
              </button>
            )}

            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3 text-zinc-400">
                <ImagePlus size={20} />
                <span className="text-zinc-200">Anexar</span>
              </div>
              <ChevronRight size={18} className="text-zinc-500" />
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3 text-zinc-200">
                <Pin size={20} className="text-zinc-400" />
                <span>Despesa fixa</span>
              </div>
              <button
                type="button"
                onClick={() => setFixedExpense(!fixedExpense)}
                className={`w-12 h-6 rounded-full transition-colors relative ${fixedExpense ? 'bg-purple-500' : 'bg-zinc-700'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${fixedExpense ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3 text-zinc-200">
                <RefreshCw size={20} className="text-zinc-400" />
                <span>Repetir</span>
              </div>
              <button
                type="button"
                onClick={() => setRepeat(!repeat)}
                className={`w-12 h-6 rounded-full transition-colors relative ${repeat ? 'bg-purple-500' : 'bg-zinc-700'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${repeat ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            <div className="flex items-center px-5 py-4 gap-3 text-zinc-400">
              <PenLine size={20} />
              <span className="text-zinc-500">Observação</span>
            </div>
          </div>

          <button
            type="submit"
            className="fixed bottom-8 right-6 h-14 w-14 rounded-full bg-red-500 flex items-center justify-center shadow-xl"
            aria-label="Confirmar cadastro"
          >
            <Check size={26} />
          </button>
        </form>


        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[80]">
            <button
              type="button"
              aria-label="Fechar modal de categorias"
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-black/80"
            />

            <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-[#161825]">
              <div className="sticky top-0 z-10 border-b border-zinc-800 bg-[#161825] px-5 py-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Selecione uma categoria</h3>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-zinc-400"
                  aria-label="Fechar"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="divide-y divide-zinc-800/60">
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(category.id);
                      setIsCategoryModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
                      categoryId === category.id
                        ? 'bg-zinc-800/50 text-red-500'
                        : 'text-zinc-200 hover:bg-zinc-800/30'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full border"
                        style={{
                          backgroundColor: alphaHex(category.color, '22'),
                          borderColor: alphaHex(category.color, '66'),
                        }}
                      >
                        {(() => {
                          const CategoryIcon = getIconComponent(category.icon);
                          return <CategoryIcon size={15} style={{ color: category.color }} />;
                        })()}
                      </span>
                      <span>{category.name}</span>
                    </span>
                    {categoryId === category.id && <Check size={20} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {accountPickerTarget && (
          <div className="fixed inset-0 z-[80]">
            <button
              type="button"
              aria-label="Fechar modal de contas"
              onClick={() => setAccountPickerTarget(null)}
              className="absolute inset-0 bg-black/80"
            />

            <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-[#161825]">
              <div className="sticky top-0 z-10 border-b border-zinc-800 bg-[#161825] px-5 py-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{accountPickerTitle}</h3>
                <button
                  type="button"
                  onClick={() => setAccountPickerTarget(null)}
                  className="text-zinc-400"
                  aria-label="Fechar"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="divide-y divide-zinc-800/60">
                {accountPickerOptions.map((account) => {
                  const isSelected =
                    accountPickerTarget === 'destination'
                      ? destinationAccountId === account.id
                      : accountId === account.id;

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => handleAccountSelection(account.id)}
                      className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
                        isSelected
                          ? 'bg-zinc-800/50 text-red-500'
                          : 'text-zinc-200 hover:bg-zinc-800/30'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full border"
                          style={{
                            backgroundColor: alphaHex(account.color, '22'),
                            borderColor: alphaHex(account.color, '66'),
                          }}
                        >
                          {(() => {
                            const AccountIcon = getIconComponent(account.icon);
                            return <AccountIcon size={15} style={{ color: account.color }} />;
                          })()}
                        </span>
                        <span>{account.name}</span>
                      </span>
                      {isSelected && <Check size={20} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
