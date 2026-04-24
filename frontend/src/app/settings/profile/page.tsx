'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { Camera, Loader2, Save } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/services/api.client';
import { useAuth } from '@/services/auth.context';

const CURRENCY_OPTIONS = [
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'USD', label: 'Dólar (USD)' },
  { code: 'BRL', label: 'Real (BRL)' },
  { code: 'GBP', label: 'Libra (GBP)' },
] as const;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Falha ao processar a imagem.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.readAsDataURL(file);
  });
}

export default function ProfileSettingsPage() {
  const { user, workspace, updateProfile, refreshUser, refreshWorkspaces } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'BRL' | 'GBP'>(
    workspace?.currency ?? 'EUR',
  );

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avatarPreview = avatarUrl.trim();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setError(null);

    try {
      if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem válido.');
      if (file.size > 2 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 2MB.');
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar imagem.');
    } finally {
      event.target.value = '';
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      setIsSaving(true);

      await updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });

      if (workspace?.id) {
        await apiClient.updateWorkspace(workspace.id, { currency });
        await refreshWorkspaces(workspace.id);
      }

      await refreshUser();
      setMessage('Perfil atualizado com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell title="Perfil" backHref="/settings">
      <div className="mx-4 my-4 pb-6">
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          {/* Avatar */}
          <div className="rounded-2xl border border-zinc-800 bg-[#1e2235] p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-700/50 flex-shrink-0">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-zinc-200">
                    {(name || user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700/40">
                <Camera size={16} />
                Trocar foto
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-400">URL da foto (opcional)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Nome */}
          <div className="rounded-2xl border border-zinc-800 bg-[#1e2235] p-4">
            <label className="mb-1 block text-xs text-zinc-400">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              required
            />
          </div>

          {/* Moeda do workspace */}
          <div className="rounded-2xl border border-zinc-800 bg-[#1e2235] p-4">
            <label className="mb-1 block text-xs text-zinc-400">Moeda do workspace</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              disabled={!workspace?.id}
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
            {!workspace?.id && (
              <p className="mt-1 text-xs text-zinc-500">Selecione um workspace para alterar a moeda.</p>
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
            disabled={isSaving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 hover:bg-purple-500"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar perfil
          </button>
        </form>
      </div>
    </PageShell>
  );
}
