'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/services/api.client';
import { WORKSPACE_CHANGED_EVENT } from '@/services/auth.context';
import type { Category, CreateCategoryDto } from '@/services/api.types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar categorias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCategories();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchCategories]);

  useEffect(() => {
    const handleWorkspaceChanged = () => {
      void fetchCategories();
    };

    window.addEventListener(WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged);

    return () => {
      window.removeEventListener(WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged);
    };
  }, [fetchCategories]);

  const createCategory = useCallback(async (input: CreateCategoryDto) => {
    try {
      setIsLoading(true);
      const newCategory = await apiClient.createCategory(input);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar categoria';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategory = useCallback(
    async (id: string, input: Partial<CreateCategoryDto>) => {
      try {
        const updated = await apiClient.updateCategory(id, input);
        const synced = await apiClient.getCategories();
        setCategories(synced);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao atualizar categoria';
        setError(message);
        throw err;
      }
    },
    [],
  );

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await apiClient.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar categoria';
      setError(message);
      throw err;
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}
