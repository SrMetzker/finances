'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/services/api.client';
import type { Card, CreateCardDto } from '@/services/api.types';

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getCards();
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar cartões');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const createCard = useCallback(async (input: CreateCardDto) => {
    try {
      setIsLoading(true);
      const newCard = await apiClient.createCard(input);
      setCards((prev) => [...prev, newCard]);
      return newCard;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar cartão';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCard = useCallback(async (id: string, input: Partial<CreateCardDto>) => {
    try {
      const updated = await apiClient.updateCard(id, input);
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar cartão';
      setError(message);
      throw err;
    }
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    try {
      await apiClient.deleteCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar cartão';
      setError(message);
      throw err;
    }
  }, []);

  return {
    cards,
    isLoading,
    error,
    createCard,
    updateCard,
    deleteCard,
    refetch: fetchCards,
  };
}
