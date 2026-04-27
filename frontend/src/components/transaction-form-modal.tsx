'use client';

import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle,
  PenLine,
  Trash2,
  X,
} from 'lucide-react';
import { BottomSheetModal } from '@/components/bottom-sheet-modal';
import { useAccounts } from '@/hooks/use-accounts-api';
import { useCategories } from '@/hooks/use-categories-api';
import { formatCurrency } from '@/lib/currency';
import { alphaHex, getIconComponent } from '@/lib/visual-options';
import { useAuth } from '@/services/auth.context';
import { notify } from '@/services/toast';
import type { CreateTransactionDto, TransactionType } from '@/services/api.types';

const TYPE_TEXT: Record<TransactionType, { createTitle: string; amountLabel: string }> = {
  ENTRADA: { createTitle: 'Nova receita', amountLabel: 'Valor da receita' },
  SAIDA: { createTitle: 'Nova despesa', amountLabel: 'Valor da despesa' },
  TRANSFERENCIA: { createTitle: 'Nova transferencia', amountLabel: 'Valor da transferencia' },
};

type DateOption = 'today' | 'yesterday' | 'other';

type TransactionFormInitialValues = {
  amount?: number;
  description?: string;
  note?: string;
  date?: string;
  isPaid?: boolean;
  isRecurring?: boolean;
  accountId?: string;
  destinationAccountId?: string;
  categoryId?: string;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function isoDateFromOffset(daysOffset: number) {
  const base = new Date();
  base.setDate(base.getDate() + daysOffset);
  return base.toISOString().slice(0, 10);
}

function isFutureDate(isoDate: string) {
  const selected = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected.getTime() > today.getTime();
}

function detectDateOption(isoDate: string): DateOption {
  if (isoDate === todayIsoDate()) return 'today';
  if (isoDate === isoDateFromOffset(-1)) return 'yesterday';
  return 'other';
}

export function TransactionFormModal({
  isOpen,
  mode,
  type,
  onClose,
  onSubmit,
  onDelete,
  initialValues,
}: {
  isOpen: boolean;
  mode: 'create' | 'edit';
  type: TransactionType;
  onClose: () => void;
  onSubmit: (payload: CreateTransactionDto) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  initialValues?: TransactionFormInitialValues;
}) {
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { workspace } = useAuth();

  const [amount, setAmount] = useState('');
  const [paid, setPaid] = useState(true);
  const [dateOption, setDateOption] = useState<DateOption>('today');
  const [customDate, setCustomDate] = useState(todayIsoDate());
  const [repeat, setRepeat] = useState(false);
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [accountPickerTarget, setAccountPickerTarget] = useState<'source' | 'destination' | null>(
    null,
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );

  const defaultCategoryId = useMemo(() => {
    if (type === 'TRANSFERENCIA' || filteredCategories.length === 0) return '';
    return filteredCategories[0].id;
  }, [filteredCategories, type]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      const initialDate = initialValues?.date?.slice(0, 10) ?? todayIsoDate();
      const derivedDateOption = detectDateOption(initialDate);
      const defaultAccountId = initialValues?.accountId ?? accounts[0]?.id ?? '';
      const defaultDestinationAccountId =
        type === 'TRANSFERENCIA'
          ? initialValues?.destinationAccountId ??
            accounts.find((account) => account.id !== defaultAccountId)?.id ??
            ''
          : '';

      setAmount(
        initialValues?.amount !== undefined
          ? String(initialValues.amount)
          : '',
      );
      setDescription(initialValues?.description ?? '');
      setNote(initialValues?.note ?? '');
      setCustomDate(initialDate);
      setDateOption(derivedDateOption);
      setPaid(initialValues?.isPaid ?? !isFutureDate(initialDate));
      setRepeat(initialValues?.isRecurring ?? false);
      setAccountId(defaultAccountId);
      setDestinationAccountId(defaultDestinationAccountId);
      setCategoryId(type === 'TRANSFERENCIA' ? '' : (initialValues?.categoryId ?? defaultCategoryId));
      setIsCategoryModalOpen(false);
      setAccountPickerTarget(null);
      setIsDeleteConfirmOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, initialValues, accounts, defaultCategoryId, type]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (type !== 'TRANSFERENCIA') {
        setDestinationAccountId('');
        return;
      }

      if (destinationAccountId === accountId) {
        const nextDestination = accounts.find((account) => account.id !== accountId);
        setDestinationAccountId(nextDestination?.id ?? '');
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [type, accountId, destinationAccountId, accounts]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      amountInputRef.current?.focus();
      amountInputRef.current?.select();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const money = (value: number) => formatCurrency(value, workspace?.currency ?? 'EUR');
  const selectedCategory = filteredCategories.find((category) => category.id === categoryId);
  const selectedAccount = accounts.find((account) => account.id === accountId);
  const availableDestinationAccounts = accounts.filter((account) => account.id !== accountId);
  const selectedDestinationAccount = availableDestinationAccounts.find(
    (account) => account.id === destinationAccountId,
  );
  const selectedCategoryIcon = getIconComponent(selectedCategory?.icon);
  const selectedAccountIcon = getIconComponent(selectedAccount?.icon);
  const selectedDestinationAccountIcon = getIconComponent(selectedDestinationAccount?.icon);
  const accountPickerOptions =
    accountPickerTarget === 'destination' ? availableDestinationAccounts : accounts;
  const accountPickerTitle =
    accountPickerTarget === 'destination' ? 'Selecione a conta destino' : 'Selecione uma conta';
  const hasFutureDate = dateOption === 'other' && isFutureDate(customDate);

  const title =
    mode === 'create'
      ? TYPE_TEXT[type].createTitle
      : `Editar ${TYPE_TEXT[type].createTitle.replace('Nova ', '').toLowerCase()}`;

  function syncPaidWithDate(isoDate: string) {
    setPaid(!isFutureDate(isoDate));
  }

  function handleDateOptionChange(option: DateOption) {
    setDateOption(option);

    if (option === 'today') {
      syncPaidWithDate(todayIsoDate());
      return;
    }

    if (option === 'yesterday') {
      syncPaidWithDate(isoDateFromOffset(-1));
      return;
    }

    syncPaidWithDate(customDate);
  }

  function handleCustomDateChange(nextDate: string) {
    setCustomDate(nextDate);
    syncPaidWithDate(nextDate);
  }

  function handleAccountSelection(selectedId: string) {
    if (accountPickerTarget === 'destination') {
      setDestinationAccountId(selectedId);
    } else {
      setAccountId(selectedId);
    }
    setAccountPickerTarget(null);
  }

  function resolveDate() {
    if (dateOption === 'today') return todayIsoDate();
    if (dateOption === 'yesterday') return isoDateFromOffset(-1);
    return customDate;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      notify.warning('Informe um valor válido.');
      return;
    }

    if (!selectedAccount) {
      notify.warning('Selecione uma conta.');
      return;
    }

    if (type !== 'TRANSFERENCIA' && !selectedCategory) {
      notify.warning('Selecione conta e categoria.');
      return;
    }

    if (type === 'TRANSFERENCIA' && !selectedDestinationAccount) {
      notify.warning('Selecione a conta destino.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateTransactionDto = {
        amount: numericAmount,
        type,
        date: resolveDate(),
        description: description.trim() || TYPE_TEXT[type].createTitle,
        isPaid: paid,
        isRecurring: repeat,
        accountId: selectedAccount.id,
      };

      const trimmedNote = note.trim();
      if (trimmedNote) {
        payload.note = trimmedNote;
      }

      if (type !== 'TRANSFERENCIA' && selectedCategory) {
        payload.categoryId = selectedCategory.id;
      }

      if (type === 'TRANSFERENCIA' && selectedDestinationAccount) {
        payload.destinationAccountId = selectedDestinationAccount.id;
      }

      await onSubmit(payload);
      notify.success(mode === 'create' ? 'Transação criada com sucesso.' : 'Transação atualizada com sucesso.');
      onClose();
    } catch (err) {
      notify.error(err, 'Erro ao salvar transação.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;

    try {
      setIsSubmitting(true);
      await onDelete();
      notify.success('Transação excluída com sucesso.');
      onClose();
    } catch (err) {
      notify.error(err, 'Erro ao excluir transação.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BottomSheetModal
      title={<h2 className="text-lg font-semibold">{title}</h2>}
      onClose={onClose}
      zIndexClassName="z-[85]"
      panelClassName="brand-panel max-h-[92vh] border border-white/6"
      closeAriaLabel="Fechar modal de transação"
      headerRight={
        mode === 'edit' && onDelete ? (
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="text-rose-400 disabled:opacity-60"
            disabled={isSubmitting}
            aria-label="Excluir transação"
          >
            <Trash2 size={18} />
          </button>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} className="pb-24">
        <div className="flex items-center justify-between border-b border-white/6 px-6 py-5">
          <div>
            <p className="mb-1 text-xs text-zinc-400">{TYPE_TEXT[type].amountLabel}</p>
            <input
              ref={amountInputRef}
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-44 border-none bg-transparent text-4xl font-bold text-white outline-none"
              required
            />
            <p className="mt-1 text-xs text-zinc-500">{money(Number(amount) || 0)}</p>
          </div>
        </div>

        <div className="divide-y divide-zinc-800/60">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3 text-zinc-200">
              <CheckCircle size={20} className="text-zinc-400" />
              <span>{paid ? 'Pago' : 'Pendente'}</span>
            </div>
            <button
              type="button"
              onClick={() => setPaid((current) => !current)}
              disabled={hasFutureDate}
              className={`relative h-6 w-12 overflow-hidden rounded-full transition-colors ${
                paid ? 'brand-gradient' : 'bg-zinc-700'
              } ${hasFutureDate ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  paid ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <Calendar size={20} className="text-zinc-400 flex-shrink-0" />
            <div className="ml-3 flex flex-1 gap-2">
              {(['today', 'yesterday', 'other'] as const).map((opt) => {
                const labels = { today: 'Hoje', yesterday: 'Ontem', other: 'Outros...' };
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleDateOptionChange(opt)}
                    className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                      dateOption === opt ? 'brand-gradient' : 'brand-panel text-zinc-300'
                    }`}
                  >
                    {labels[opt]}
                  </button>
                );
              })}
            </div>
          </div>

          {dateOption === 'other' && (
            <div className="px-5 pb-4">
              <div className="brand-panel ml-8 rounded-2xl border border-white/8 p-3">
                <p className="mb-2 text-xs text-zinc-400">Selecione o dia da transação</p>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => handleCustomDateChange(e.target.value)}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-lime-300"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-5 py-4">
            <PenLine size={20} className="text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              className="flex-1 bg-transparent text-zinc-200 outline-none placeholder-zinc-500"
            />
          </div>

          {type !== 'TRANSFERENCIA' && (
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
                  {createElement(selectedCategoryIcon, {
                    size: 15,
                    style: { color: selectedCategory?.color ?? '#6366F1' },
                  })}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-200 brand-gradient-soft">
                  {selectedCategory?.name ?? 'Categoria'}
                </span>
              </div>
            </button>
          )}

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
                {createElement(selectedAccountIcon, {
                  size: 15,
                  style: { color: selectedAccount?.color ?? '#EF4444' },
                })}
              </span>
              <span className="brand-gradient-soft flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-200">
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
                  {createElement(selectedDestinationAccountIcon, {
                    size: 15,
                    style: { color: selectedDestinationAccount?.color ?? '#10B981' },
                  })}
                </span>
                <span className="brand-gradient-soft flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-200">
                  {selectedDestinationAccount?.name ?? 'Conta destino'}
                </span>
              </div>
            </button>
          )}

          <div className="flex items-start gap-3 px-5 py-4">
            <PenLine size={20} className="mt-1 text-zinc-400 flex-shrink-0" />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Observação"
              rows={3}
              className="flex-1 resize-none rounded-2xl border border-white/8 bg-transparent px-3 py-2 text-zinc-200 outline-none placeholder-zinc-500 focus:border-lime-300"
            />
          </div>

        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="brand-gradient brand-glow fixed bottom-8 right-6 flex h-14 w-14 items-center justify-center rounded-full shadow-xl disabled:opacity-60"
          aria-label={mode === 'create' ? 'Confirmar cadastro' : 'Salvar alterações'}
        >
          <Check size={26} />
        </button>
      </form>

      {isCategoryModalOpen && type !== 'TRANSFERENCIA' && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Fechar modal de categorias"
            onClick={() => setIsCategoryModalOpen(false)}
            className="absolute inset-0 bg-black/80"
          />

          <div className="brand-panel absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl border border-white/6">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/6 bg-[rgba(39,38,37,0.95)] px-5 py-3 backdrop-blur-xl">
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
                  className={`flex w-full items-center justify-between px-5 py-4 transition-colors ${
                    categoryId === category.id
                        ? 'bg-white/8 text-lime-300'
                        : 'text-zinc-200 hover:bg-white/5'
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
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Fechar modal de contas"
            onClick={() => setAccountPickerTarget(null)}
            className="absolute inset-0 bg-black/80"
          />

          <div className="brand-panel absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl border border-white/6">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/6 bg-[rgba(39,38,37,0.95)] px-5 py-3 backdrop-blur-xl">
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
                    className={`flex w-full items-center justify-between px-5 py-4 transition-colors ${
                      isSelected ? 'bg-white/8 text-lime-300' : 'text-zinc-200 hover:bg-white/5'
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

      {isDeleteConfirmOpen && onDelete && (
        <div className="fixed inset-0 z-[95]">
          <button
            type="button"
            aria-label="Fechar confirmação de exclusão"
            onClick={() => setIsDeleteConfirmOpen(false)}
            className="absolute inset-0 bg-black/80"
          />

          <div className="rounded-t-3xl border border-white/6 bg-[linear-gradient(180deg,rgba(61,29,29,0.92),rgba(42,23,23,0.96))] px-5 pb-7 pt-5 shadow-2xl absolute inset-x-0 bottom-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-zinc-100">Excluir transação</h4>
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="text-zinc-400"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm leading-6 text-zinc-300">
              Essa ação removerá a transação e atualizará o saldo da conta quando ela impactar o cálculo atual.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="brand-panel rounded-2xl border border-white/8 px-4 py-3 text-sm font-semibold text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isSubmitting}
                className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </BottomSheetModal>
  );
}
