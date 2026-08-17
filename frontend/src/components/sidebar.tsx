'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Blocks,
  ListCheck,
  BarChart3,
  Landmark,
  CreditCard,
  Tags,
  Settings,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/services/auth.context';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Blocks },
  { href: '/transactions', label: 'Transações', icon: ListCheck },
  { href: '/accounts', label: 'Contas', icon: Landmark },
  { href: '/cards', label: 'Cartões', icon: CreditCard },
  { href: '/categories', label: 'Categorias', icon: Tags },
  { href: '/charts', label: 'Gráficos', icon: BarChart3 },
] as const;

export function Sidebar({ onAddTransaction }: { onAddTransaction?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    logout();
    router.push('/auth/login');
  }

  return (
    <aside className="brand-panel sticky top-0 hidden h-screen w-64 flex-col border-r border-white/5 px-4 py-6 lg:flex">
      <Link href="/dashboard" className="flex items-center justify-center gap-2 px-2">
        <span className="brand-accent-text text-3xl font-bold tracking-tight">Finances</span>
      </Link>

      <button
        type="button"
        onClick={onAddTransaction}
        className="brand-gradient brand-glow mt-6 flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.02]"
      >
        <Plus size={16} />
        Nova transação
      </button>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-white/8 text-lime-300'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/6 pt-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive('/settings')
              ? 'bg-white/8 text-lime-300'
              : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
          }`}
        >
          <Settings size={18} />
          Configurações
        </Link>

        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="brand-gradient flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-zinc-950">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="Avatar do usuário" className="h-full w-full object-cover" />
            ) : (
              user?.name.charAt(0).toUpperCase() || 'U'
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/6 hover:text-rose-300"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
