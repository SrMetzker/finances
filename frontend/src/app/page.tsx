import { PageShell } from '@/components/page-shell';
import { StatCard } from '@/components/stat-card';
import {
  MOCK_ACCOUNTS,
  MOCK_CATEGORY_CHART,
  MOCK_TRANSACTIONS,
} from '@/services/mock-data';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function DashboardPage() {
  const totalBalance = MOCK_ACCOUNTS.reduce(
    (s, a) => s + a.currentBalance,
    0,
  );
  const totalIncome = MOCK_TRANSACTIONS.filter(
    (t) => t.type === 'ENTRADA',
  ).reduce((s, t) => s + t.amount, 0);
  const totalExpense = MOCK_TRANSACTIONS.filter(
    (t) => t.type === 'SAIDA',
  ).reduce((s, t) => s + t.amount, 0);
  const maxExpense = Math.max(...MOCK_CATEGORY_CHART.map((c) => c.total), 1);

  return (
    <PageShell title="Dashboard">
      {/* stat cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Saldo total"
          value={brl.format(totalBalance)}
          accent="emerald"
        />
        <StatCard
          label="Entradas (abr)"
          value={brl.format(totalIncome)}
          accent="emerald"
        />
        <StatCard
          label="Saídas (abr)"
          value={brl.format(totalExpense)}
          accent="red"
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {/* account balances */}
        <div className="rounded-xl border border-zinc-800 bg-[#0b101c] p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-300">
            Saldo por conta
          </h3>
          <ul className="space-y-2 text-sm">
            {MOCK_ACCOUNTS.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg bg-zinc-900/50 px-3 py-2"
              >
                <span className="text-zinc-200">{a.name}</span>
                <span className="font-semibold text-emerald-400">
                  {brl.format(a.currentBalance)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* expense chart */}
        <div className="rounded-xl border border-zinc-800 bg-[#0b101c] p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-300">
            Despesas por categoria
          </h3>
          <ul className="space-y-3">
            {MOCK_CATEGORY_CHART.map((c) => (
              <li key={c.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-zinc-200">{c.category}</span>
                  <span className="text-zinc-400">{brl.format(c.total)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(c.total / maxExpense) * 100}%`,
                      background: c.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
