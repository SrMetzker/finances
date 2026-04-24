'use client';

import { useMemo, useState } from 'react';
import { Edit, X } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { useAuth } from '@/services/auth.context';
import { apiClient } from '@/services/api.client';

export default function WorkspacesPage() {
  const { workspaces, workspaceId, setWorkspaceId, refreshWorkspaces } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalTitle = useMemo(
    () => (editingWorkspaceId ? 'Editar workspace' : 'Novo workspace'),
    [editingWorkspaceId],
  );

  function openCreateModal() {
    setEditingWorkspaceId(null);
    setName('');
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(id: string, currentName: string) {
    setEditingWorkspaceId(id);
    setName(currentName);
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Informe um nome para o workspace.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (editingWorkspaceId) {
        await apiClient.updateWorkspace(editingWorkspaceId, { name: trimmedName });
        await refreshWorkspaces(editingWorkspaceId);
      } else {
        const created = await apiClient.createWorkspace({ name: trimmedName });
        await refreshWorkspaces(created.id);
      }

      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar workspace.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell title="Workspaces" onHeaderAdd={openCreateModal}>
      <div className="px-4 py-4">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#1e2235]">
          {workspaces.map((workspace, index) => (
            <div
              key={workspace.id}
              className={`flex items-center justify-between px-4 py-4 ${
                index < workspaces.length - 1 ? 'border-b border-zinc-700/40' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => setWorkspaceId(workspace.id)}
                className="flex-1 text-left"
                aria-label={`Selecionar workspace ${workspace.name}`}
              >
                <p className="text-sm font-semibold text-zinc-100">{workspace.name}</p>
                <p className="text-xs text-zinc-400">
                  {workspace.id === workspaceId ? 'Workspace ativo' : 'Toque para ativar'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => openEditModal(workspace.id, workspace.name)}
                className="ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-600 bg-zinc-700/30 text-zinc-300 hover:text-zinc-100"
                aria-label={`Editar workspace ${workspace.name}`}
              >
                <Edit size={15} />
              </button>
            </div>
          ))}

          {workspaces.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-400">
              Nenhum workspace encontrado.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={closeModal}
            className="absolute inset-0 bg-black/80"
          />

          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-[#1f2332] px-5 pb-7 pt-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">{modalTitle}</h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1 text-zinc-400"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-300">Nome</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="Ex.: Empresa, Casa, Investimentos"
                  autoFocus
                />
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold transition hover:bg-purple-500 disabled:opacity-60"
              >
                {isSaving ? 'Salvando...' : editingWorkspaceId ? 'Salvar alterações' : 'Criar workspace'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
