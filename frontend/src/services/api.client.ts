import type {
  Account,
  Card,
  Category,
  Transaction,
  User,
  Workspace,
  CreateTransactionDto,
  CreateAccountDto,
  CreateCardDto,
  CreateCategoryDto,
  AuthResponse,
  RegisterDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from './api.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;
  private workspaceId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      this.workspaceId = localStorage.getItem('workspace_id');
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  setWorkspaceId(id: string | null) {
    this.workspaceId = id;

    if (id) {
      localStorage.setItem('workspace_id', id);
      return;
    }

    localStorage.removeItem('workspace_id');
  }

  getToken() {
    return this.token;
  }

  getWorkspaceId() {
    return this.workspaceId;
  }

  clearAuth() {
    this.token = null;
    this.workspaceId = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('workspace_id');
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.workspaceId) {
      headers['X-Workspace-ID'] = this.workspaceId;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${url}`, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  login(email: string, password: string) {
    return this.request<AuthResponse>('POST', '/auth/login', { email, password });
  }

  register(data: RegisterDto) {
    return this.request<AuthResponse>('POST', '/auth/register', data);
  }

  // Users endpoints
  getCurrentUser() {
    return this.request<User>('GET', '/users/me');
  }

  // Workspaces endpoints
  getWorkspaces() {
    return this.request<Workspace[]>('GET', '/workspaces');
  }

  createWorkspace(data: CreateWorkspaceDto) {
    return this.request<Workspace>('POST', '/workspaces', data);
  }

  updateWorkspace(id: string, data: UpdateWorkspaceDto) {
    return this.request<Workspace>('PATCH', `/workspaces/${id}`, data);
  }

  // Accounts endpoints
  getAccounts() {
    return this.request<Account[]>('GET', '/accounts');
  }

  createAccount(data: CreateAccountDto) {
    return this.request<Account>('POST', '/accounts', data);
  }

  getAccount(id: string) {
    return this.request<Account>('GET', `/accounts/${id}`);
  }

  updateAccount(id: string, data: Partial<CreateAccountDto>) {
    return this.request<Account>('PATCH', `/accounts/${id}`, data);
  }

  deleteAccount(id: string) {
    return this.request<{ deleted: boolean }>('DELETE', `/accounts/${id}`);
  }

  // Cards endpoints
  getCards() {
    return this.request<Card[]>('GET', '/cards');
  }

  createCard(data: CreateCardDto) {
    return this.request<Card>('POST', '/cards', data);
  }

  getCard(id: string) {
    return this.request<Card>('GET', `/cards/${id}`);
  }

  updateCard(id: string, data: Partial<CreateCardDto>) {
    return this.request<Card>('PATCH', `/cards/${id}`, data);
  }

  deleteCard(id: string) {
    return this.request<{ deleted: boolean }>('DELETE', `/cards/${id}`);
  }

  // Categories endpoints
  getCategories() {
    return this.request<Category[]>('GET', '/categories');
  }

  createCategory(data: CreateCategoryDto) {
    return this.request<Category>('POST', '/categories', data);
  }

  getCategory(id: string) {
    return this.request<Category>('GET', `/categories/${id}`);
  }

  updateCategory(id: string, data: Partial<CreateCategoryDto>) {
    return this.request<Category>('PATCH', `/categories/${id}`, data);
  }

  deleteCategory(id: string) {
    return this.request<{ deleted: boolean }>('DELETE', `/categories/${id}`);
  }

  // Transactions endpoints
  getTransactions(month?: number, year?: number) {
    let url = '/transactions';
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', month.toString());
    if (year !== undefined) params.append('year', year.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<Transaction[]>('GET', url);
  }

  createTransaction(data: CreateTransactionDto) {
    return this.request<Transaction>('POST', '/transactions', data);
  }

  getTransaction(id: string) {
    return this.request<Transaction>('GET', `/transactions/${id}`);
  }

  updateTransaction(id: string, data: Partial<CreateTransactionDto>) {
    return this.request<Transaction>('PATCH', `/transactions/${id}`, data);
  }

  deleteTransaction(id: string) {
    return this.request<{ deleted: boolean }>('DELETE', `/transactions/${id}`);
  }
}

export const apiClient = new ApiClient();
