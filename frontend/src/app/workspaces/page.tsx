'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const nameInputRef = useRef<HTMLInputElement>(null);

  const modalTitle = useMemo(
    () => (editingWorkspaceId ? 'Editar workspace' : 'Novo workspace'),
    [editingWorkspaceId],
  );

  useEffect(() => {
    if (!isModalOpen) return;

    const timeoutId = window.setTimeout(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isModalOpen]);

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
        <div className="brand-surface overflow-hidden rounded-[1.75rem]">
          {workspaces.map((workspace, index) => (
            <div
              key={workspace.id}
              className={`flex items-center justify-between px-4 py-4 ${
                index < workspaces.length - 1 ? 'border-b border-white/6' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => setWorkspaceId(workspace.id)}
                className="flex-1 text-left"
                aria-label={`Selecionar workspace ${workspace.name}`}
              >
                <p className="text-sm font-semibold text-zinc-100">{workspace.name}</p>
                <p className="text-xs text-zinc-400/90">
                  {workspace.id === workspaceId ? 'Workspace ativo' : 'Toque para ativar'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => openEditModal(workspace.id, workspace.name)}
                className="brand-gradient-soft ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-lime-300/20 text-lime-300 transition hover:scale-[1.03]"
                aria-label={`Editar workspace ${workspace.name}`}
              >
                <Edit size={15} />
              </button>
            </div>
          ))}

          {workspaces.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-400/90">
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
            className="absolute inset-0 bg-black/82"
          />

          <div className="brand-panel absolute inset-x-0 bottom-0 rounded-t-3xl border border-white/6 px-5 pb-7 pt-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="brand-accent-text text-base font-semibold">{modalTitle}</h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1 text-zinc-400 transition hover:text-zinc-100"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-300">Nome</span>
                <input
                  ref={nameInputRef}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-lime-300"
                  placeholder="Ex.: Empresa, Casa, Investimentos"
                />
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isSaving}
                className="brand-gradient inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition hover:scale-[1.01] disabled:opacity-60"
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
