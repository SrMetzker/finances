'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { apiClient } from '@/services/api.client';
import type {
  AuthResponse,
  User,
  Workspace,
  RegisterDto,
  UpdateProfileDto,
} from '@/services/api.types';
import {
  supabaseSignInWithPassword,
  supabaseSignUpWithPassword,
} from '@/services/supabase-auth';

type LoginLeadData = {
  phone?: string;
  marketingConsent?: boolean;
  leadSource?: string;
  leadCampaign?: string;
};

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  isAuthenticated: boolean;
  isLoading: boolean;
  workspaceId: string | null;
  login: (email: string, password: string, leadData?: LoginLeadData) => Promise<void>;
  register: (input: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (input: UpdateProfileDto) => Promise<void>;
  setWorkspaceId: (id: string) => void;
  refreshWorkspaces: (preferredWorkspaceId?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const WORKSPACE_CHANGED_EVENT = 'finances:workspace-changed';
const AUTH_EXPIRED_EVENT = 'finances:auth-expired';

async function persistFrontendSession(token: string) {
  const response = await fetch('/api/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error('Falha ao persistir sessão no frontend.');
  }
}

async function clearFrontendSession() {
  await fetch('/api/session', {
    method: 'DELETE',
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null);

  const applyWorkspaceSelection = useCallback(
    (availableWorkspaces: Workspace[], nextWorkspaceId?: string | null) => {
      const selectedWorkspace = nextWorkspaceId
        ? availableWorkspaces.find((item) => item.id === nextWorkspaceId) ?? null
        : availableWorkspaces[0] ?? null;

      setWorkspaces(availableWorkspaces);
      setWorkspace(selectedWorkspace);
      setWorkspaceIdState(selectedWorkspace?.id ?? null);
      apiClient.setWorkspaceId(selectedWorkspace?.id ?? null);

      if (selectedWorkspace) {
        localStorage.setItem('workspace', JSON.stringify(selectedWorkspace));
        window.dispatchEvent(
          new CustomEvent(WORKSPACE_CHANGED_EVENT, {
            detail: { workspaceId: selectedWorkspace.id },
          }),
        );
        return;
      }

      localStorage.removeItem('workspace');
    },
    [],
  );

  const syncWorkspaces = useCallback(
    async (preferredWorkspaceId?: string | null, fallbackWorkspace?: Workspace | null) => {
      const availableWorkspaces = await apiClient.getWorkspaces();
      const workspacesToUse =
        availableWorkspaces.length > 0
          ? availableWorkspaces
          : fallbackWorkspace
            ? [fallbackWorkspace]
            : [];

      applyWorkspaceSelection(
        workspacesToUse,
        preferredWorkspaceId ?? fallbackWorkspace?.id ?? workspacesToUse[0]?.id ?? null,
      );
    },
    [applyWorkspaceSelection],
  );

  // Initialize from localStorage
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem('workspace_id');

    if (savedWorkspaceId) {
      apiClient.setWorkspaceId(savedWorkspaceId);
    }

    const timeoutId = window.setTimeout(() => {
      apiClient.getCurrentUser()
        .then(async (userData) => {
          setUser(userData);
          await syncWorkspaces(savedWorkspaceId ?? userData.lastWorkspaceId ?? null);
        })
        .catch(() => {
          // Sessao invalida/expirada: limpamos o estado local.
          void clearFrontendSession().catch(() => {
            // Ignora falha de limpeza de cookie de sessao local.
          });
          localStorage.removeItem('workspace_id');
          localStorage.removeItem('workspace');
          apiClient.clearAuth();
          setWorkspaces([]);
          setWorkspace(null);
          setWorkspaceIdState(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [syncWorkspaces]);

  const login = useCallback(async (email: string, password: string, leadData?: LoginLeadData) => {
    try {
      setIsLoading(true);
      let response: AuthResponse;

      try {
        const supabaseSession = await supabaseSignInWithPassword(
          normalizeEmail(email),
          password,
        );

        response = await apiClient.exchangeSupabaseSession({
          accessToken: supabaseSession.access_token,
          phone: leadData?.phone,
          marketingConsent: leadData?.marketingConsent,
          leadSource: leadData?.leadSource,
          leadCampaign: leadData?.leadCampaign,
        });
      } catch {
        try {
          response = await apiClient.migrateLocalUser({
            email: normalizeEmail(email),
            password,
            phone: leadData?.phone,
            marketingConsent: leadData?.marketingConsent,
            leadSource: leadData?.leadSource,
            leadCampaign: leadData?.leadCampaign,
          });
        } catch {
          // Fallback temporário para preservar acesso caso a migração não esteja habilitada.
          response = await apiClient.login(normalizeEmail(email), password);
        }
      }

      await persistFrontendSession(response.accessToken);
      setUser(response.user);
      await syncWorkspaces(response.workspace?.id ?? null, response.workspace ?? null);
    } finally {
      setIsLoading(false);
    }
  }, [syncWorkspaces]);

  const register = useCallback(async (input: RegisterDto) => {
    try {
      setIsLoading(true);

      const signup = await supabaseSignUpWithPassword({
        email: normalizeEmail(input.email),
        password: input.password,
        name: input.name.trim(),
        phone: input.phone?.trim() || undefined,
      });

      if (!signup.access_token) {
        throw new Error(
          'Cadastro criado no Supabase. Confirme seu e-mail e faça login para concluir a vinculação da conta.',
        );
      }

      const response = await apiClient.exchangeSupabaseSession({
        accessToken: signup.access_token,
        name: input.name.trim(),
        workspaceName: input.workspaceName?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        marketingConsent: input.marketingConsent,
        leadSource: input.leadSource,
        leadCampaign: input.leadCampaign,
      });

      await persistFrontendSession(response.accessToken);
      setUser(response.user);

      await syncWorkspaces(response.workspace?.id ?? null, response.workspace ?? null);
    } finally {
      setIsLoading(false);
    }
  }, [syncWorkspaces]);

  const logout = useCallback(() => {
    void apiClient.logout().catch(() => {
      // Mesmo com erro no backend, limpamos o estado local.
    });
    void clearFrontendSession().catch(() => {
      // Mesmo com erro na rota interna, limpamos o estado local.
    });
    apiClient.clearAuth();
    setUser(null);
    setWorkspace(null);
    setWorkspaces([]);
    setWorkspaceIdState(null);
    localStorage.removeItem('workspace_id');
    localStorage.removeItem('workspace');
  }, []);

  useEffect(() => {
    function handleAuthExpired() {
      logout();
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [logout]);

  const refreshUser = useCallback(async () => {
    const current = await apiClient.getCurrentUser();
    setUser(current);
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileDto) => {
    const updated = await apiClient.updateCurrentUserProfile(input);
    setUser(updated);
  }, []);

  const setWorkspaceId = useCallback((id: string) => {
    applyWorkspaceSelection(workspaces, id);
    void apiClient.updateCurrentUserLastWorkspace(id).catch(() => {
      // Mesmo com falha de persistência remota, mantemos a troca local aplicada.
    });
  }, [applyWorkspaceSelection, workspaces]);

  const refreshWorkspaces = useCallback(
    async (preferredWorkspaceId?: string | null) => {
      await syncWorkspaces(preferredWorkspaceId ?? workspaceId ?? workspace?.id ?? null, workspace);
    },
    [syncWorkspaces, workspace, workspaceId],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        workspaces,
        isAuthenticated: !!user,
        isLoading,
        workspaceId,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        setWorkspaceId,
        refreshWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
