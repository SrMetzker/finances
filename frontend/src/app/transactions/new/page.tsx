import { PageShell } from '@/components/page-shell';

export default function NewTransactionPage() {
  return (
    <PageShell title="Nova Transação">
      <form className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-400">
            Descrição
          </label>
          <input
            required
            placeholder="Ex.: Supermercado"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-400">
            Valor (R$)
          </label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-400">
            Data
          </label>
          <input
            required
            type="date"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-400">
            Tipo
          </label>
          <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
            <option value="TRANSFERENCIA">Transferência</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-400">
            Conta de origem
          </label>
          <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
            <option>Nubank</option>
            <option>Bradesco</option>
            <option>Carteira</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-400">
            Categoria
          </label>
          <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
            <option>Salário</option>
            <option>Alimentação</option>
            <option>Transporte</option>
            <option>Lazer</option>
            <option>Saúde</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs uppercase tracking-wide text-zinc-400">
            Observação (opcional)
          </label>
          <textarea
            rows={3}
            placeholder="Notas adicionais..."
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="paid"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 accent-emerald-500"
          />
          <label htmlFor="paid" className="text-sm text-zinc-300">
            Marcar como paga
          </label>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-black transition hover:bg-emerald-400"
          >
            Salvar transação
          </button>
        </div>
      </form>
    </PageShell>
  );
}
