'use client';

import { FormEvent, useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/services/api.client';

export default function PasswordSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmNewPassword) {
      setError('A confirmação da nova senha não coincide.');
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.changeCurrentUserPassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setMessage('Senha alterada com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell title="Senha" backHref="/settings">
      <div className="mx-4 my-4 pb-6">
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div className="brand-surface rounded-[1.75rem] p-4 space-y-3">
            <input
              type="password"
              placeholder="Senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-lime-300"
              required
            />
            <input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-lime-300"
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-lime-300"
              required
              minLength={6}
            />
          </div>

          {message && (
            <p className="rounded-lg border border-green-700/60 bg-green-950/30 px-3 py-2 text-sm text-green-200">{message}</p>
          )}
          {error && (
            <p className="rounded-lg border border-red-800/60 bg-red-950/30 px-3 py-2 text-sm text-red-200">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="brand-gradient inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60 hover:scale-[1.01]"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Atualizar senha
          </button>
        </form>
      </div>
    </PageShell>
  );
}
