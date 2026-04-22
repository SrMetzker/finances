import { FloatingActionButton } from '@/components/floating-action-button';
import { PageShell } from '@/components/page-shell';
import { MOCK_CARDS } from '@/services/mock-data';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function CardsPage() {
  return (
    <PageShell title="Cartões de Crédito">
      <ul className="space-y-3">
        {MOCK_CARDS.map((card) => (
          <li
            key={card.id}
            className="rounded-xl border border-zinc-800 bg-[#0b101c] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-zinc-100">{card.name}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Limite: {brl.format(card.limit)}
                </p>
              </div>
              <div className="text-right text-xs text-zinc-500 space-y-0.5">
                <p>Fecha dia {card.closingDay}</p>
                <p>Vence dia {card.dueDay}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <FloatingActionButton href="/cards" />
    </PageShell>
  );
}
