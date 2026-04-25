'use client';

import { FormEvent, useState } from 'react';
import { BriefcaseBusiness, Loader2, Save } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/services/api.client';
import { useAuth } from '@/services/auth.context';

const CURRENCY_OPTIONS = [
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'USD', label: 'Dólar (USD)' },
  { code: 'BRL', label: 'Real (BRL)' },
  { code: 'GBP', label: 'Libra (GBP)' },
] as const;

export default function WorkspaceSettingsPage() {
  const { workspace, refreshWorkspaces } = useAuth();
  const activeWorkspaceId = workspace?.id ?? null;
  const [draft, setDraft] = useState<{
    workspaceId: string | null;
    name: string;
    currency: 'EUR' | 'USD' | 'BRL' | 'GBP';
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workspaceName =
    draft && draft.workspaceId === activeWorkspaceId ? draft.name : workspace?.name ?? '';
  const currency =
    draft && draft.workspaceId === activeWorkspaceId
      ? draft.currency
      : workspace?.currency ?? 'EUR';

  function updateDraft(next: Partial<{ name: string; currency: 'EUR' | 'USD' | 'BRL' | 'GBP' }>) {
    setDraft({
      workspaceId: activeWorkspaceId,
      name: next.name ?? workspaceName,
      currency: next.currency ?? currency,
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!workspace?.id) {
      setError('Nenhum workspace ativo encontrado.');
      return;
    }

    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      setError('Informe um nome para o workspace.');
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.updateWorkspace(workspace.id, {
        name: trimmedName,
        currency,
      });
      await refreshWorkspaces(workspace.id);
      setDraft(null);
      setMessage('Workspace atualizado com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar workspace.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell title="Workspace" backHref="/settings">
      <div className="mx-4 my-4 pb-6">
        <form onSubmit={(event) => { void handleSubmit(event); }} className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#1e2235] p-4">
            <div className="mb-4 flex items-center gap-2">
              <BriefcaseBusiness size={18} className="text-amber-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                Workspace ativo
              </h2>
            </div>

            <label className="mb-4 block">
              <span className="mb-1 block text-xs text-zinc-400">Nome do workspace</span>
              <input
                type="text"
                value={workspaceName}
                onChange={(event) => updateDraft({ name: event.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                disabled={!workspace?.id}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs text-zinc-400">Moeda do workspace</span>
              <select
                value={currency}
                onChange={(event) => updateDraft({ currency: event.target.value as 'EUR' | 'USD' | 'BRL' | 'GBP' })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                disabled={!workspace?.id}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {!workspace?.id && (
              <p className="mt-3 text-xs text-zinc-500">
                Selecione um workspace para editar as configurações.
              </p>
            )}
          </div>

          {message && (
            <p className="rounded-lg border border-green-700/60 bg-green-950/30 px-3 py-2 text-sm text-green-200">{message}</p>
          )}
          {error && (
            <p className="rounded-lg border border-red-800/60 bg-red-950/30 px-3 py-2 text-sm text-red-200">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSaving || !workspace?.id}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 hover:bg-purple-500"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar workspace
          </button>
        </form>
      </div>
    </PageShell>
  );
}