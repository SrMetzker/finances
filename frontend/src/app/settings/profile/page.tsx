'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { Camera, Loader2, Save, Trash2 } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { useAuth } from '@/services/auth.context';

const AVATAR_MAX_DIMENSION = 512;
const AVATAR_JPEG_QUALITY = 0.82;
const MAX_AVATAR_BASE64_LENGTH = 2_500_000;

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

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Falha ao abrir imagem selecionada.'));
    image.src = dataUrl;
  });
}

async function compressAvatarImage(file: File): Promise<string> {
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImageFromDataUrl(originalDataUrl);

  const ratio = Math.min(
    1,
    AVATAR_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível processar a imagem.');
  }

  context.drawImage(image, 0, 0, width, height);

  const compressedDataUrl = canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY);
  return compressedDataUrl.length < originalDataUrl.length
    ? compressedDataUrl
    : originalDataUrl;
}

export default function ProfileSettingsPage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

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
      const dataUrl = await compressAvatarImage(file);
      if (dataUrl.length > MAX_AVATAR_BASE64_LENGTH) {
        throw new Error('A imagem ainda ficou grande demais. Tente outra foto com menor resolução.');
      }
      setAvatarUrl(dataUrl);
      setSelectedFileName(file.name);
      setMessage('Foto pronta para salvar no perfil (otimizada automaticamente).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar imagem.');
    } finally {
      event.target.value = '';
    }
  }

  function handleChooseFile() {
    fileInputRef.current?.click();
  }

  function handleRemovePhoto() {
    setAvatarUrl('');
    setSelectedFileName(null);
    setMessage('Foto removida. Clique em "Salvar perfil" para confirmar.');
    setError(null);
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

      await refreshUser();
      setSelectedFileName(null);
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
          <div className="brand-surface rounded-[1.75rem] p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="brand-gradient flex h-20 w-20 items-center justify-center overflow-hidden rounded-full flex-shrink-0">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-zinc-200">
                    {(name || user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleChooseFile}
                  className="brand-panel inline-flex items-center gap-2 rounded-2xl border border-white/8 px-3 py-2 text-sm text-zinc-100 hover:bg-white/6"
                >
                  <Camera size={16} />
                  {avatarPreview ? 'Trocar foto' : 'Adicionar foto'}
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-800/70 px-3 py-2 text-sm text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 size={16} />
                    Remover foto
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-zinc-400">
              Use uma imagem JPG, PNG ou WEBP de até 2MB. A foto será otimizada automaticamente.
            </p>
            {selectedFileName && (
              <p className="text-xs text-zinc-500">Arquivo selecionado: {selectedFileName}</p>
            )}
          </div>

          {/* Nome */}
          <div className="brand-surface rounded-[1.75rem] p-4">
            <label className="mb-1 block text-xs text-zinc-400">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-lime-300"
              required
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
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar perfil
          </button>
        </form>
      </div>
    </PageShell>
  );
}
