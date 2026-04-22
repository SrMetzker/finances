import { FloatingActionButton } from '@/components/floating-action-button';
import { PageShell } from '@/components/page-shell';
import { MOCK_ACCOUNTS } from '@/services/mock-data';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function AccountsPage() {
  return (
    <PageShell title="Contas">
      <ul className="space-y-3">
        {MOCK_ACCOUNTS.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#0b101c] p-4"
          >
            <div>
              <p className="font-semibold text-zinc-100">{a.name}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Saldo inicial: {brl.format(a.initialBalance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-400">
                {brl.format(a.currentBalance)}
              </p>
              <p className="text-xs text-zinc-500">saldo atual</p>
            </div>
          </li>
        ))}
      </ul>
      <FloatingActionButton href="/accounts" />
    </PageShell>
  );
}
