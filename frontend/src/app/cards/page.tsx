import { PageShell } from '@/components/page-shell';
import { CreditCard } from 'lucide-react';

export default function CardsPage() {
  return (
    <PageShell title="Cartões">
      <div className="brand-surface mx-4 mt-4 flex flex-col items-center rounded-[1.75rem] p-6 py-10 text-center">
        <div className="brand-gradient-soft mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-lime-300/20">
          <CreditCard size={32} className="text-lime-300" />
        </div>
        <p className="text-sm font-semibold text-zinc-200">
          Ops! Você ainda não tem nenhum<br />cartão de crédito cadastrado.
        </p>
        <p className="mt-2 text-xs text-zinc-500">Em breve essa área também seguirá o novo padrão visual completo.</p>
      </div>
    </PageShell>
  );
}
