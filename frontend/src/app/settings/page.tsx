'use client';

import Link from 'next/link';
import { BriefcaseBusiness, ChevronRight, KeyRound, ShieldAlert, UserCircle2 } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { useAuth } from '@/services/auth.context';

const MENU_ITEMS = [
  {
    href: '/settings/profile',
    icon: UserCircle2,
    label: 'Perfil',
    description: 'Nome e foto do perfil',
    iconClass: 'text-lime-300',
  },
  {
    href: '/settings/workspace',
    icon: BriefcaseBusiness,
    label: 'Workspace',
    description: 'Nome e moeda do workspace ativo',
    iconClass: 'text-amber-400',
  },
  {
    href: '/settings/password',
    icon: KeyRound,
    label: 'Senha',
    description: 'Alterar sua senha de acesso',
    iconClass: 'text-blue-400',
  },
  {
    href: '/settings/privacy',
    icon: ShieldAlert,
    label: 'Privacidade e Conta',
    description: 'Redefinir dados ou excluir conta',
    iconClass: 'text-red-400',
  },
] as const;

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <PageShell title="Configurações" backHref="/more">
      <div className="mx-4 my-4 space-y-3 pb-6">
        {/* Avatar + nome do usuário */}
        <div className="brand-surface flex items-center gap-3 rounded-[1.75rem] p-4">
          <div className="brand-gradient flex h-14 w-14 items-center justify-center overflow-hidden rounded-full flex-shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-zinc-200">
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-zinc-100">{user?.name ?? '—'}</p>
            <p className="text-xs text-zinc-400">{user?.email ?? ''}</p>
          </div>
        </div>

        {/* Menu itens */}
        <div className="brand-surface overflow-hidden rounded-[1.75rem]">
          {MENU_ITEMS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-4 transition-colors hover:bg-white/5 ${
                index < MENU_ITEMS.length - 1 ? 'border-b border-white/6' : ''
              }`}
            >
              <div className="brand-gradient-soft flex h-9 w-9 items-center justify-center rounded-full border border-lime-300/10 flex-shrink-0">
                <item.icon size={18} className={item.iconClass} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100">{item.label}</p>
                <p className="text-xs text-zinc-500 truncate">{item.description}</p>
              </div>
              <ChevronRight size={16} className="text-lime-200/70 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
