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
import type { User, Workspace, RegisterDto, UpdateProfileDto } from '@/services/api.types';

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  isAuthenticated: boolean;
  isLoading: boolean;
  workspaceId: string | null;
  login: (email: string, password: string) => Promise<void>;
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
      Promise.all([apiClient.getCurrentUser(), syncWorkspaces(savedWorkspaceId)])
        .then(([userData]) => {
          setUser(userData);
        })
        .catch(() => {
          // Sessao invalida/expirada: limpamos o estado local.
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

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(email, password);
      setUser(response.user);
      await syncWorkspaces(response.workspace?.id ?? null, response.workspace ?? null);
    } finally {
      setIsLoading(false);
    }
  }, [syncWorkspaces]);

  const register = useCallback(async (input: RegisterDto) => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(input);
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
