'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  AlignJustify,
  PieChart,
  MoreHorizontal,
  ArrowLeft,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Plus,
  LogOut,
  Settings,
} from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { QuickActionsMenu, type QuickActionItem } from '@/components/quick-actions-menu';
import { NewTransactionModal } from '@/components/new-transaction-modal';
import { useTransactions } from '@/hooks/use-transactions-api';
import { useAuth } from '@/services/auth.context';
import type { CreateTransactionDto, TransactionType } from '@/services/api.types';

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Principal', icon: Home },
  { href: '/transactions', label: 'Transações', icon: AlignJustify },
  null,
  { href: '/categories', label: 'Categorias', icon: PieChart },
  { href: '/more', label: 'Mais', icon: MoreHorizontal },
] as const;

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'transferencia',
    label: 'Transferencia',
    icon: Repeat,
    iconClassName: 'text-lime-300',
  },
  {
    id: 'receita',
    label: 'Receita',
    icon: ArrowUpRight,
    iconClassName: 'text-green-400',
  },
  {
    id: 'despesa',
    label: 'Despesa',
    icon: ArrowDownRight,
    iconClassName: 'text-red-400',
  },
];

export function PageShell({
  title,
  backHref,
  headerRight,
  hideBottomNav,
  onHeaderAdd,
  children,
}: {
  title: ReactNode;
  backHref?: string;
  headerRight?: ReactNode;
  hideBottomNav?: boolean;
  onHeaderAdd?: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { createTransaction } = useTransactions();
  const { user, logout } = useAuth();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [newTransactionType, setNewTransactionType] = useState<TransactionType>('SAIDA');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const shouldShowHeaderAdd = useMemo(
    () =>
      pathname === '/transactions' ||
      pathname === '/accounts' ||
      pathname === '/categories',
    [pathname],
  );

  function isBottomNavItemActive(href: string) {
    if (href === '/more') {
      return (
        pathname === '/more' ||
        pathname.startsWith('/accounts') ||
        pathname.startsWith('/settings')
      );
    }

    return pathname === href;
  }

  function toggleQuickActions() {
    setShowQuickActions((v) => !v);
  }

  function closeNewTransactionModal() {
    setShowNewTransactionModal(false);
  }

  function handleQuickActionSelect(actionId: string) {
    const map: Record<string, TransactionType> = {
      receita: 'ENTRADA',
      despesa: 'SAIDA',
      transferencia: 'TRANSFERENCIA',
    };

    setNewTransactionType(map[actionId] ?? 'SAIDA');
    setShowQuickActions(false);
    setShowNewTransactionModal(true);
  }

  const handleCreateTransaction = async (payload: CreateTransactionDto) => {
    await createTransaction(payload);
  };

  function handleAvatarClick() {
    setShowUserMenu((v) => !v);
  }

  function handleLogout() {
    logout();
    setShowUserMenu(false);
    router.push('/auth/login');
  }

  function handleHeaderAddClick() {
    if (onHeaderAdd) {
      onHeaderAdd();
      return;
    }

    if (pathname === '/transactions') {
      setNewTransactionType('SAIDA');
      setShowNewTransactionModal(true);
    }
  }

  return (
    <div className="brand-grid flex min-h-screen flex-col text-[var(--text)]">
      {/* top bar */}
      <header className="brand-panel sticky top-0 z-30 flex items-center justify-between border-b border-white/5 px-4 py-3 backdrop-blur-xl">
        {backHref ? (
          <Link href={backHref} className="flex h-9 w-9 items-center justify-center">
            <ArrowLeft size={22} />
          </Link>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="brand-gradient brand-glow flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-xs font-bold"
              aria-label="Abrir menu do usuário"
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt="Avatar do usuário"
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name.charAt(0).toUpperCase() || 'U'
              )}
            </button>

            {showUserMenu && (
              <div className="brand-surface absolute left-0 top-11 z-50 min-w-44 rounded-2xl p-1.5">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-100 transition-colors hover:bg-white/6"
                >
                  <Settings size={14} />
                  Configurações
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition-colors hover:bg-white/6"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {typeof title === 'string' ? (
          <button className="flex items-center gap-1 text-base font-semibold tracking-[0.02em]">
            {title}
            {!backHref && <ChevronDown size={16} className="text-lime-200/80" />}
          </button>
        ) : (
          <div className="flex flex-1 justify-center px-3">{title}</div>
        )}

        {headerRight !== undefined ? (
          headerRight
        ) : backHref ? (
          <div className="w-9" />
        ) : shouldShowHeaderAdd ? (
          <button
            type="button"
            onClick={handleHeaderAddClick}
            className="brand-gradient brand-glow flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-[1.04]"
            aria-label="Adicionar"
          >
            <Plus size={18} />
          </button>
        ) : (
          <div className="h-9">
          </div>
        )}
      </header>

      {/* content */}
      <main className={`flex-1 ${hideBottomNav ? '' : 'pb-20'}`}>{children}</main>

      {/* bottom nav */}
      {!hideBottomNav && (
        <nav className="brand-panel fixed bottom-0 left-0 right-0 flex h-16 items-end border-t border-white/5 backdrop-blur-xl">
          {BOTTOM_NAV.map((item) =>
            item === null ? (
              <QuickActionsMenu
                key="fab"
                isOpen={showQuickActions}
                onToggle={toggleQuickActions}
                onSelect={handleQuickActionSelect}
                items={QUICK_ACTIONS}
              />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors ${
                  isBottomNavItemActive(item.href) ? 'text-lime-300' : 'text-zinc-500'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ),
          )}
        </nav>
      )}

      <NewTransactionModal
        isOpen={showNewTransactionModal}
        type={newTransactionType}
        onClose={closeNewTransactionModal}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
}
