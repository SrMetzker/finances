'use client';

import { PageShell } from '@/components/page-shell';
import { IconColorPicker } from '@/components/icon-color-picker';
import { useCategories } from '@/hooks/use-categories-api';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  alphaHex,
  getIconComponent,
  type VisualIconName,
} from '@/lib/visual-options';
import type { CategoryType } from '@/services/api.types';
import { Pencil, Plus, X } from 'lucide-react';
import { useState } from 'react';

const TYPE_COLOR: Record<string, string> = {
  ENTRADA: 'text-green-400 bg-green-900/30',
  SAIDA: 'text-red-400 bg-red-900/30',
  TRANSFERENCIA: 'text-blue-400 bg-blue-900/30',
};

const TYPE_LABEL: Record<string, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  TRANSFERENCIA: 'Transferência',
};

export default function CategoriesPage() {
  const { categories, createCategory, updateCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('SAIDA');
  const [icon, setIcon] = useState<VisualIconName>(DEFAULT_CATEGORY_ICON);
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = editingCategoryId !== null;

  function openCreateModal() {
    setEditingCategoryId(null);
    setName('');
    setType('SAIDA');
    setIcon(DEFAULT_CATEGORY_ICON);
    setColor(DEFAULT_CATEGORY_COLOR);
    setIsModalOpen(true);
  }

  function openEditModal(category: {
    id: string;
    name: string;
    type: CategoryType;
    icon: string;
    color: string;
  }) {
    setEditingCategoryId(category.id);
    setName(category.name);
    setType(category.type);
    setIcon((category.icon as VisualIconName) || DEFAULT_CATEGORY_ICON);
    setColor(category.color || DEFAULT_CATEGORY_COLOR);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingCategoryId(null);
    setName('');
    setType('SAIDA');
    setIcon(DEFAULT_CATEGORY_ICON);
    setColor(DEFAULT_CATEGORY_COLOR);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setIsSaving(true);
      if (isEditing && editingCategoryId) {
        await updateCategory(editingCategoryId, { name: trimmedName, type, icon, color });
      } else {
        await createCategory({ name: trimmedName, type, icon, color });
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell title="Categorias" onHeaderAdd={openCreateModal}>
      <div className="brand-surface mx-4 mt-4 divide-y divide-white/6 rounded-[1.75rem]">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: alphaHex(cat.color, '22'),
                  borderColor: alphaHex(cat.color, '66'),
                }}
              >
                {(() => {
                  const CategoryIcon = getIconComponent(cat.icon);
                  return <CategoryIcon size={15} style={{ color: cat.color }} />;
                })()}
              </div>
              <p className="font-medium">{cat.name}</p>
              <button
                type="button"
                onClick={() =>
                  openEditModal({
                    id: cat.id,
                    name: cat.name,
                    type: cat.type as CategoryType,
                    icon: cat.icon,
                    color: cat.color,
                  })
                }
                className="text-lime-300"
                aria-label={`Editar categoria ${cat.name}`}
              >
                <Pencil size={14} />
              </button>
            </div>
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${TYPE_COLOR[cat.type]}`}>
              {TYPE_LABEL[cat.type]}
            </span>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={closeModal}
            aria-label="Fechar modal"
          />

          <div className="brand-panel absolute inset-x-0 bottom-0 rounded-t-3xl border border-white/6 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isEditing ? 'Editar categoria' : 'Nova categoria'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-zinc-400"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-400">Nome</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 outline-none focus:border-lime-300"
                  placeholder="Ex.: Mercado"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-zinc-400">Tipo</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CategoryType)}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 outline-none focus:border-lime-300"
                >
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saída</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                </select>
              </label>

              <IconColorPicker
                selectedIcon={icon}
                selectedColor={color}
                onChangeIcon={setIcon}
                onChangeColor={setColor}
              />

              <button
                type="submit"
                disabled={isSaving}
                className="brand-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 font-semibold disabled:opacity-60"
              >
                {!isEditing && <Plus size={16} />}
                {isSaving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar categoria'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
