'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/services/api.client';
import { WORKSPACE_CHANGED_EVENT } from '@/services/auth.context';
import type { ReportAnalytics } from '@/services/api.types';

export function useReportsAnalytics(month: number, year: number) {
  const [data, setData] = useState<ReportAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getReportAnalytics(month, year);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchData]);

  useEffect(() => {
    const handleWorkspaceChanged = () => {
      void fetchData();
    };

    window.addEventListener(WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged);

    return () => {
      window.removeEventListener(WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged);
    };
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
