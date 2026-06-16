type SupabaseSignInResponse = {
  access_token: string;
  user: {
    id: string;
    email?: string;
  };
};

type SupabaseError = {
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
};

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

function ensureSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configuração do Supabase ausente no frontend.');
  }
}

function parseSupabaseError(payload: SupabaseError, fallback: string) {
  return (
    payload.error_description?.trim() ||
    payload.message?.trim() ||
    payload.msg?.trim() ||
    payload.error?.trim() ||
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
      phone: input.phone,
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
