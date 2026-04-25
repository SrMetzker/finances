'use client';

import Link from 'next/link';
import { ChevronRight, Landmark, Settings } from 'lucide-react';
import { PageShell } from '@/components/page-shell';

const MENU_ITEMS = [
  {
    href: '/accounts',
    title: 'Contas',
    description: 'Gerencie suas contas e saldos',
    icon: Landmark,
  },
  {
    href: '/settings',
    title: 'Configurações',
    description: 'Perfil, workspace, senha e privacidade',
    icon: Settings,
  },
] as const;

export default function MorePage() {
  return (
    <PageShell title="Mais">
      <div className="px-4 py-4">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#1e2235]">
          {MENU_ITEMS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-4 transition-colors hover:bg-zinc-700/20 ${
                index < MENU_ITEMS.length - 1 ? 'border-b border-zinc-700/40' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-600 bg-zinc-700/30">
                  <item.icon size={18} className="text-zinc-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.description}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-500" />
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
