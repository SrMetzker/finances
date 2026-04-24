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
  isAuthenticated: boolean;
  isLoading: boolean;
  workspaceId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterDto) => Promise<void>;
  logout: () => void;
  setWorkspaceId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedWorkspaceId = localStorage.getItem('workspace_id');
    const savedWorkspace = localStorage.getItem('workspace');

    if (savedWorkspaceId) {
      setWorkspaceIdState(savedWorkspaceId);
      apiClient.setWorkspaceId(savedWorkspaceId);
    }

    if (savedWorkspace) {
      try {
        setWorkspace(JSON.parse(savedWorkspace));
      } catch {
        // Invalid JSON, ignore
      }
    }

    if (token) {
      apiClient.setToken(token);
      // Try to fetch current user
      apiClient
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('workspace_id');
          localStorage.removeItem('workspace');
          apiClient.clearAuth();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.accessToken);
      setUser(response.user);

      // Set workspace if provided
      if (response.workspace) {
        setWorkspace(response.workspace);
        apiClient.setWorkspaceId(response.workspace.id);
        setWorkspaceIdState(response.workspace.id);
        localStorage.setItem('workspace_id', response.workspace.id);
        localStorage.setItem('workspace', JSON.stringify(response.workspace));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterDto) => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(input);
      apiClient.setToken(response.accessToken);
      setUser(response.user);

      if (response.workspace) {
        setWorkspace(response.workspace);
        apiClient.setWorkspaceId(response.workspace.id);
        setWorkspaceIdState(response.workspace.id);
        localStorage.setItem('workspace_id', response.workspace.id);
        localStorage.setItem('workspace', JSON.stringify(response.workspace));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.clearAuth();
    setUser(null);
    setWorkspace(null);
    setWorkspaceIdState(null);
    localStorage.removeItem('workspace_id');
    localStorage.removeItem('workspace');
  }, []);

  const setWorkspaceId = useCallback((id: string) => {
    setWorkspaceIdState(id);
    apiClient.setWorkspaceId(id);
    localStorage.setItem('workspace_id', id);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        isAuthenticated: !!user,
        isLoading,
        workspaceId,
        login,
        register,
        logout,
        setWorkspaceId,
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
