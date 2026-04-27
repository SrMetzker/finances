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
import { notify } from '@/services/toast';
import { MoreVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
export default function CategoriesPage() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [openMenuCategoryId, setOpenMenuCategoryId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('SAIDA');
  const [activeType, setActiveType] = useState<CategoryType>('SAIDA');
  const [icon, setIcon] = useState<VisualIconName>(DEFAULT_CATEGORY_ICON);
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  const isEditing = editingCategoryId !== null;
  const visibleCategories = useMemo(
    () => categories.filter((category) => category.type === activeType),
    [categories, activeType],
  );

  const rootCategories = useMemo(
    () => visibleCategories.filter((category) => !category.parentCategoryId),
    [visibleCategories],
  );

  const subcategoriesByParent = useMemo(() => {
    const groups = new Map<string, typeof visibleCategories>();
    for (const category of visibleCategories) {
      if (!category.parentCategoryId) {
        continue;
      }

      const current = groups.get(category.parentCategoryId) ?? [];
      groups.set(category.parentCategoryId, [...current, category]);
    }

    return groups;
  }, [visibleCategories]);

  const parentCategoryLabel = useMemo(() => {
    if (!parentCategoryId) {
      return null;
    }

    return categories.find((category) => category.id === parentCategoryId)?.name ?? null;
  }, [categories, parentCategoryId]);

  function openCreateModal() {
    setEditingCategoryId(null);
    setParentCategoryId(null);
    setOpenMenuCategoryId(null);
    setName('');
    setType(activeType);
    setIcon(DEFAULT_CATEGORY_ICON);
    setColor(DEFAULT_CATEGORY_COLOR);
    setIsModalOpen(true);
  }

  function openCreateSubcategory(category: {
    id: string;
    type: CategoryType;
    color: string;
  }) {
    setEditingCategoryId(null);
    setParentCategoryId(category.id);
    setOpenMenuCategoryId(null);
    setName('');
    setType(category.type);
    setIcon(DEFAULT_CATEGORY_ICON);
    setColor(category.color || DEFAULT_CATEGORY_COLOR);
    setIsModalOpen(true);
  }

  function openEditModal(category: {
    id: string;
    name: string;
    type: CategoryType;
    icon: string;
    color: string;
    parentCategoryId?: string | null;
  }) {
    setEditingCategoryId(category.id);
    setParentCategoryId(category.parentCategoryId ?? null);
    setOpenMenuCategoryId(null);
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
    setParentCategoryId(null);
    setName('');
    setType('SAIDA');
    setIcon(DEFAULT_CATEGORY_ICON);
    setColor(DEFAULT_CATEGORY_COLOR);
  }

  async function handleDeleteCategory(category: { id: string; name: string }) {
    const confirmed = window.confirm(
      `Excluir categoria "${category.name}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCategory(category.id);
      setOpenMenuCategoryId(null);
      notify.success('Categoria excluída com sucesso.');
    } catch (error) {
      notify.error(error, 'Não foi possível excluir a categoria.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setIsSaving(true);
      const payload = {
        name: trimmedName,
        type,
        icon,
        color,
        ...(parentCategoryId ? { parentCategoryId } : {}),
      };

      if (isEditing && editingCategoryId) {
        await updateCategory(editingCategoryId, payload);
        notify.success(parentCategoryId ? 'Subcategoria atualizada com sucesso.' : 'Categoria atualizada com sucesso.');
      } else {
        await createCategory(payload);
        notify.success(parentCategoryId ? 'Subcategoria criada com sucesso.' : 'Categoria criada com sucesso.');
      }
      setIsModalOpen(false);
    } catch (error) {
      notify.error(error, 'Não foi possível salvar a categoria.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell title="Categorias" onHeaderAdd={openCreateModal}>
      <div className="mx-4 mt-4">
        <div className="brand-panel inline-flex w-full items-center rounded-full border border-white/8 p-1">
          {(['SAIDA', 'ENTRADA'] as const).map((tabType) => (
            <button
              key={tabType}
              type="button"
              onClick={() => {
                setActiveType(tabType);
                if (!isEditing) {
                  setType(tabType);
                }
              }}
              className={`w-1/2 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition ${
                activeType === tabType
                  ? 'brand-gradient text-zinc-950'
                  : 'text-zinc-300 hover:bg-white/6'
              }`}
            >
              {tabType === 'SAIDA' ? 'Despesas' : 'Receitas'}
            </button>
          ))}
        </div>
      </div>

      <div className="brand-surface mx-4 mt-4 divide-y divide-white/6 rounded-[1.75rem]">
        {rootCategories.map((cat) => {
          const subcategories = subcategoriesByParent.get(cat.id) ?? [];

          return (
            <div key={cat.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
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
                  <p className="truncate font-medium">{cat.name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openCreateSubcategory({
                        id: cat.id,
                        type: cat.type as CategoryType,
                        color: cat.color,
                      })
                    }
                    className="brand-gradient-soft flex h-8 w-8 items-center justify-center rounded-full border border-lime-300/20 text-lime-300"
                    aria-label={`Adicionar subcategoria em ${cat.name}`}
                  >
                    <Plus size={14} />
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuCategoryId((current) =>
                          current === cat.id ? null : cat.id,
                        )
                      }
                      className="text-zinc-400 transition hover:text-zinc-200"
                      aria-label={`Abrir menu da categoria ${cat.name}`}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenuCategoryId === cat.id && (
                      <div className="brand-panel absolute right-0 top-8 z-20 min-w-36 rounded-xl border border-white/10 p-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal({
                              id: cat.id,
                              name: cat.name,
                              type: cat.type as CategoryType,
                              icon: cat.icon,
                              color: cat.color,
                              parentCategoryId: cat.parentCategoryId,
                            })
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-white/8"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteCategory({ id: cat.id, name: cat.name })}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-white/8"
                        >
                          <X size={14} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {subcategories.length > 0 && (
                <ul className="mt-3 space-y-2 pl-2">
                  {subcategories.map((sub) => (
                    <li key={sub.id} className="flex items-center justify-between gap-3 py-1 text-zinc-200">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="truncate text-sm">{sub.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal({
                            id: sub.id,
                            name: sub.name,
                            type: sub.type as CategoryType,
                            icon: sub.icon,
                            color: sub.color,
                            parentCategoryId: sub.parentCategoryId,
                          })
                        }
                        className="shrink-0 text-zinc-500 transition hover:text-zinc-200"
                        aria-label={`Editar subcategoria ${sub.name}`}
                      >
                        <Pencil size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {rootCategories.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-zinc-400">
            Nenhuma categoria cadastrada para {activeType === 'SAIDA' ? 'despesas' : 'receitas'}.
          </div>
        )}
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
                {isEditing
                  ? parentCategoryId
                    ? 'Editar subcategoria'
                    : 'Editar categoria'
                  : parentCategoryId
                    ? 'Nova subcategoria'
                    : 'Nova categoria'}
              </h2>
              <div className="flex items-center gap-2">
                {isEditing && editingCategoryId && (
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        const cat = categories.find((c) => c.id === editingCategoryId);
                        if (!cat) return;
                        const confirmed = window.confirm(
                          `Excluir ${
                            parentCategoryId ? 'subcategoria' : 'categoria'
                          } "${cat.name}"? Esta ação não pode ser desfeita.`,
                        );
                        if (!confirmed) return;
                        try {
                          await deleteCategory(editingCategoryId);
                          notify.success(parentCategoryId ? 'Subcategoria excluída com sucesso.' : 'Categoria excluída com sucesso.');
                          closeModal();
                        } catch (error) {
                          notify.error(error, 'Não foi possível excluir.');
                        }
                      })();
                    }}
                    className="text-red-400 transition hover:text-red-300"
                    aria-label="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-zinc-400"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-400">Nome</span>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-3 py-2 outline-none focus:border-lime-300"
                  placeholder="Ex.: Mercado"
                  required
                />
              </label>

              <p className="text-sm text-zinc-400">
                Tipo: <span className="font-semibold text-zinc-200">{type === 'SAIDA' ? 'Despesa' : 'Receita'}</span>
              </p>

              {parentCategoryLabel && (
                <p className="text-sm text-zinc-400">
                  Categoria pai: <span className="font-semibold text-zinc-200">{parentCategoryLabel}</span>
                </p>
              )}

              {!parentCategoryId && (
                <IconColorPicker
                  selectedIcon={icon}
                  selectedColor={color}
                  onChangeIcon={setIcon}
                  onChangeColor={setColor}
                />
              )}

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
