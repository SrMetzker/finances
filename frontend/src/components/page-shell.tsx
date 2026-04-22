import Link from 'next/link';
import { type ReactNode } from 'react';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/transactions', label: 'Transações' },
  { href: '/accounts', label: 'Contas' },
  { href: '/cards', label: 'Cartões' },
  { href: '/categories', label: 'Categorias' },
];

export function PageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090c14] text-zinc-100 font-sans">
      {/* mobile top bar */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-[#0f1522] px-4 py-3 md:hidden">
        <span className="text-lg font-bold text-emerald-400">Finances</span>
      </header>

      <div className="mx-auto flex max-w-6xl gap-0 md:gap-6 md:p-6">
        {/* sidebar */}
        <aside className="hidden w-56 flex-shrink-0 rounded-2xl border border-zinc-800 bg-[#0f1522] p-5 md:block">
          <h1 className="mb-6 text-xl font-bold text-emerald-400">Finances</h1>
          <nav className="space-y-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="block rounded-lg px-3 py-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* main area */}
        <main className="flex-1 rounded-none md:rounded-2xl border-0 md:border border-zinc-800 bg-[#0f1522] p-5">
          <h2 className="mb-6 text-xl font-semibold">{title}</h2>
          {children}
        </main>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-zinc-800 bg-[#0f1522] md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="flex flex-1 flex-col items-center py-2 text-xs text-zinc-400 hover:text-white"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
