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
import type { User, Workspace, RegisterDto } from '@/services/api.types';

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
  setWorkspaceId: (id: string) => void;
  refreshWorkspaces: (preferredWorkspaceId?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const WORKSPACE_CHANGED_EVENT = 'finances:workspace-changed';

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
    const token = localStorage.getItem('auth_token');
    const savedWorkspaceId = localStorage.getItem('workspace_id');

    if (!token) {
      const timeoutId = window.setTimeout(() => {
        setIsLoading(false);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    apiClient.setToken(token);
    if (savedWorkspaceId) {
      apiClient.setWorkspaceId(savedWorkspaceId);
    }

    const timeoutId = window.setTimeout(() => {
      Promise.all([apiClient.getCurrentUser(), syncWorkspaces(savedWorkspaceId)])
        .then(([userData]) => {
          setUser(userData);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
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
      apiClient.setToken(response.accessToken);
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
      apiClient.setToken(response.accessToken);
      setUser(response.user);

      await syncWorkspaces(response.workspace?.id ?? null, response.workspace ?? null);
    } finally {
      setIsLoading(false);
    }
  }, [syncWorkspaces]);

  const logout = useCallback(() => {
    apiClient.clearAuth();
    setUser(null);
    setWorkspace(null);
    setWorkspaces([]);
    setWorkspaceIdState(null);
    localStorage.removeItem('workspace_id');
    localStorage.removeItem('workspace');
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
