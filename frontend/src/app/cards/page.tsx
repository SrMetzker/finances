import { PageShell } from '@/components/page-shell';
import { CreditCard } from 'lucide-react';

export default function CardsPage() {
  return (
    <PageShell title="Cartões">
      <div className="mx-4 mt-4 rounded-2xl bg-[#1e2235] p-6 flex flex-col items-center text-center py-10">
        <CreditCard size={44} className="text-zinc-600 mb-3" />
        <p className="text-sm font-semibold text-zinc-200">
          Ops! Você ainda não tem nenhum<br />cartão de crédito cadastrado.
        </p>
      </div>
    </PageShell>
  );
}
