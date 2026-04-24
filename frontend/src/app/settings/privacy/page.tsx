'use client';

import { useState } from 'react';
import { Eraser, Loader2, Trash2 } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/services/api.client';
import { useAuth } from '@/services/auth.context';

export default function PrivacySettingsPage() {
  const { logout } = useAuth();

  const [deletePassword, setDeletePassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResetData() {
    setMessage(null);
    setError(null);

    const confirmed = window.confirm(
      'Isso removerá TODAS as transações, contas, cartões e categorias dos seus workspaces. Deseja continuar?',
    );
    if (!confirmed) return;

    try {
      setIsResetting(true);
      await apiClient.resetCurrentUserData();
      window.dispatchEvent(new CustomEvent('finances:transactions-changed'));
      window.dispatchEvent(new CustomEvent('finances:workspace-changed'));
      setMessage('Dados financeiros redefinidos com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir dados.');
    } finally {
      setIsResetting(false);
    }
  }

  async function handleDeleteAccount() {
    setMessage(null);
    setError(null);

    if (!deletePassword.trim()) {
      setError('Informe sua senha para excluir a conta.');
      return;
    }

    const confirmed = window.confirm(
      'Essa ação é irreversível e excluirá sua conta definitivamente. Confirmar exclusão?',
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteCurrentUserAccount({ password: deletePassword });
      logout();
      window.location.href = '/auth/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <PageShell title="Privacidade e Conta" backHref="/settings">
      <div className="mx-4 my-4 space-y-4 pb-6">
        {/* Redefinir dados */}
        <div className="rounded-2xl border border-zinc-800 bg-[#1e2235] p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-100">Redefinir dados financeiros</p>
            <p className="text-xs text-zinc-500 mt-0.5">Remove todas as transações, contas, cartões e categorias, mantendo sua conta ativa.</p>
          </div>
          <button
            type="button"
            onClick={() => void handleResetData()}
            disabled={isResetting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-600 px-4 py-2.5 text-sm font-semibold text-zinc-100 disabled:opacity-60 hover:bg-zinc-700/30"
          >
            {isResetting ? <Loader2 size={16} className="animate-spin" /> : <Eraser size={16} />}
            Redefinir dados (manter conta)
          </button>
        </div>

        {/* Excluir conta */}
        <div className="rounded-2xl border border-red-900/60 bg-[#251823] p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-red-200">Excluir conta</p>
            <p className="text-xs text-red-300/70 mt-0.5">Ação irreversível. Todos os seus dados serão permanentemente removidos.</p>
          </div>
          <input
            type="password"
            placeholder="Confirme sua senha"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className="w-full rounded-lg border border-red-800/70 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-600"
          />
          <button
            type="button"
            onClick={() => void handleDeleteAccount()}
            disabled={isDeleting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:bg-red-500"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Excluir conta
          </button>
        </div>

        {message && (
          <p className="rounded-lg border border-green-700/60 bg-green-950/30 px-3 py-2 text-sm text-green-200">{message}</p>
        )}
        {error && (
          <p className="rounded-lg border border-red-800/60 bg-red-950/30 px-3 py-2 text-sm text-red-200">{error}</p>
        )}
      </div>
    </PageShell>
  );
}
