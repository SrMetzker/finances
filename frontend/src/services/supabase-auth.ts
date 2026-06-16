type SupabaseSignInResponse = {
  access_token: string;
  user: {
    id: string;
    email?: string;
  };
};

type SupabaseError = {
  code?: number;
  error_code?: string;
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
};

function normalizeSupabaseBaseUrl(rawUrl: string) {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');

  // Accept wrongly pasted API paths and keep only the project base URL.
  return trimmed.replace(/\/(auth|rest)\/v1(?:\/.*)?$/i, '');
}

const supabaseUrl = normalizeSupabaseBaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
);
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

function ensureSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configuração do Supabase ausente no frontend.');
  }
}

function parseSupabaseError(payload: SupabaseError, fallback: string) {
  const rawMessage =
    payload.error_description?.trim() ||
    payload.message?.trim() ||
    payload.msg?.trim() ||
    payload.error?.trim() ||
    '';

  // Friendly copy for common Supabase validation failure in signup payloads.
  if (
    payload.error_code === 'validation_failed' ||
    /only an email address or phone number should be provided on signup/i.test(
      rawMessage,
    )
  ) {
    return 'Falha no cadastro: o provedor de autenticação exige apenas e-mail para este fluxo.';
  }

  return (
    rawMessage ||
    fallback
  );
}

export async function supabaseSignInWithPassword(email: string, password: string) {
  ensureSupabaseEnv();

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as SupabaseError;
    throw new Error(parseSupabaseError(payload, 'Falha ao autenticar no Supabase.'));
  }

  return (await response.json()) as SupabaseSignInResponse;
}

export async function supabaseSignUpWithPassword(input: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  ensureSupabaseEnv();

  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: {
        name: input.name,
      },
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as SupabaseError;
    throw new Error(parseSupabaseError(payload, 'Falha ao cadastrar no Supabase Auth.'));
  }

  const payload = (await response.json()) as {
    access_token?: string;
    user?: {
      id: string;
      email?: string;
    };
  };

  return payload;
}
