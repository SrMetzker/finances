'use client';

import { FloatingActionButton } from '@/components/floating-action-button';
import { PageShell } from '@/components/page-shell';
import { useMonthFilter } from '@/hooks/use-month-filter';
import { MOCK_TRANSACTIONS } from '@/services/mock-data';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const TYPE_LABEL: Record<string, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  TRANSFERENCIA: 'Transf.',
};

const TYPE_COLOR: Record<string, string> = {
  ENTRADA: 'text-emerald-400',
  SAIDA: 'text-red-400',
  TRANSFERENCIA: 'text-blue-400',
};

export default function TransactionsPage() {
  const { month, setMonth } = useMonthFilter(new Date('2026-04-01'));

  return (
    <PageShell title="Transações">
      {/* month filter */}
      <div className="mb-4">
        <label
          htmlFor="month"
          className="mb-1 block text-xs text-zinc-400 uppercase tracking-wide"
        >
          Filtrar por mês
        </label>
        <input
          id="month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </div>

      {/* table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Conta</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3 text-center">Pago</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TRANSACTIONS.map((tx) => (
              <tr
                key={tx.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/30"
              >
                <td className="px-4 py-3 text-zinc-400">{tx.date}</td>
                <td className="px-4 py-3 font-medium text-zinc-100">
                  {tx.description}
                </td>
                <td className="px-4 py-3 text-zinc-300">{tx.accountName}</td>
                <td className="px-4 py-3 text-zinc-300">{tx.categoryName}</td>
                <td className={`px-4 py-3 ${TYPE_COLOR[tx.type]}`}>
                  {TYPE_LABEL[tx.type]}
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${TYPE_COLOR[tx.type]}`}
                >
                  {tx.type === 'SAIDA' ? '-' : '+'}
                  {brl.format(tx.amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  {tx.isPaid ? (
                    <span className="text-emerald-400">✓</span>
                  ) : (
                    <span className="text-zinc-500">–</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FloatingActionButton href="/transactions/new" />
    </PageShell>
  );
}
