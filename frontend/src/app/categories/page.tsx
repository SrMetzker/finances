import { FloatingActionButton } from '@/components/floating-action-button';
import { PageShell } from '@/components/page-shell';
import { MOCK_CATEGORIES } from '@/services/mock-data';

const TYPE_COLOR: Record<string, string> = {
  ENTRADA: 'bg-emerald-900/40 text-emerald-400',
  SAIDA: 'bg-red-900/40 text-red-400',
  TRANSFERENCIA: 'bg-blue-900/40 text-blue-400',
};

const TYPE_LABEL: Record<string, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  TRANSFERENCIA: 'Transferência',
};

export default function CategoriesPage() {
  return (
    <PageShell title="Categorias">
      <ul className="space-y-2">
        {MOCK_CATEGORIES.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#0b101c] px-4 py-3"
          >
            <p className="font-medium text-zinc-100">{cat.name}</p>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${TYPE_COLOR[cat.type]}`}
            >
              {TYPE_LABEL[cat.type]}
            </span>
          </li>
        ))}
      </ul>
      <FloatingActionButton href="/categories/new" />
    </PageShell>
  );
}
