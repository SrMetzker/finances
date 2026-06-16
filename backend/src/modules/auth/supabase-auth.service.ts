import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SupabaseUserResponse = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
};

type SupabaseAdminCreateUserResponse = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
};

function normalizeSupabaseBaseUrl(rawUrl: string) {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');

  // Accept wrongly pasted API paths and keep only the project base URL.
  return trimmed.replace(/\/(auth|rest)\/v1(?:\/.*)?$/i, '');
}

@Injectable()
export class SupabaseAuthService {
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;
  private readonly supabaseServiceRoleKey: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.readConfig('SUPABASE_URL');
    this.supabaseAnonKey = this.readConfig('SUPABASE_ANON_KEY');
    this.supabaseServiceRoleKey = this.readConfig('SUPABASE_SERVICE_ROLE_KEY');
  }

  async getUserFromAccessToken(accessToken: string) {
    this.ensurePublicConfig();

    const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: this.supabaseAnonKey,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Sessão Supabase inválida ou expirada.');
    }

    return (await response.json()) as SupabaseUserResponse;
  }

  async createUserWithPassword(input: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) {
    this.ensurePublicConfig();

    if (!this.supabaseServiceRoleKey) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY não configurada. Defina esta variável para migrar usuários legados.',
      );
    }

    const response = await fetch(`${this.supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.supabaseServiceRoleKey}`,
        apikey: this.supabaseServiceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          name: input.name,
        },
        phone: input.phone,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message || 'Falha ao criar usuário no Supabase Auth.');
    }

    return (await response.json()) as SupabaseAdminCreateUserResponse;
  }

  async signInWithPassword(email: string, password: string) {
    this.ensurePublicConfig();

    const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: this.supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error_description?: string };
      throw new UnauthorizedException(payload.error_description || 'Credenciais Supabase inválidas.');
    }

    const payload = (await response.json()) as {
      access_token: string;
      user: SupabaseUserResponse;
    };

    return payload;
  }

  private readConfig(key: string) {
    const value = this.configService.get<string>(key)?.trim() || '';
    if (key === 'SUPABASE_URL') {
      return normalizeSupabaseBaseUrl(value);
    }
    return value.replace(/\/+$/, '');
  }

  private ensurePublicConfig() {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY devem estar configuradas.');
    }
  }
}
