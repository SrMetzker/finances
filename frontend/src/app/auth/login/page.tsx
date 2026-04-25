'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/auth.context';
import { ArrowRight, LogOut } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isLoading, isAuthenticated, user, logout } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // If already authenticated, show logout option
  if (isAuthenticated && user) {
    return (
      <div className="brand-grid flex min-h-screen items-center justify-center px-4 py-8">
        <div className="brand-surface w-full max-w-md rounded-[2rem] p-8">
          <h1 className="brand-accent-text mb-8 text-center text-3xl font-bold">Finances</h1>

          <div className="brand-gradient-soft mb-6 rounded-2xl p-4 text-zinc-100">
            <p className="text-sm text-zinc-400">Usuário autenticado:</p>
            <p className="text-lg font-semibold text-white">{user.email}</p>
            <p className="text-sm text-zinc-300">{user.name}</p>
          </div>

          <button
            onClick={() => {
              logout();
              setName('');
              setEmail('');
              setPassword('');
              setWorkspaceName('');
              setConfirmPassword('');
              setMode('login');
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="brand-gradient mt-3 w-full rounded-2xl py-3 font-semibold transition-transform hover:scale-[1.01]"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        workspaceName: workspaceName.trim() || undefined,
      });

      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    }
  };

  return (
    <div className="brand-grid flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="brand-surface rounded-[2rem] p-8">
          <h1 className="brand-accent-text mb-2 text-center text-4xl font-bold tracking-[0.04em]">Finances</h1>
          <p className="mb-6 text-center text-sm text-zinc-400">Controle financeiro pessoal</p>

          <div className="brand-panel mb-6 grid grid-cols-2 rounded-2xl p-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                mode === 'login' ? 'brand-gradient' : 'text-zinc-400'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                mode === 'register' ? 'brand-gradient' : 'text-zinc-400'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="brand-panel w-full rounded-2xl border border-white/8 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-300 disabled:opacity-50"
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="brand-panel w-full rounded-2xl border border-white/8 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-300 disabled:opacity-50"
                placeholder="joao@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="brand-panel w-full rounded-2xl border border-white/8 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-300 disabled:opacity-50"
                placeholder="•••••••••"
                required
              />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">Confirmar senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="brand-panel w-full rounded-2xl border border-white/8 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-300 disabled:opacity-50"
                    placeholder="Repita a senha"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">Nome do workspace</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    disabled={isLoading}
                    className="brand-panel w-full rounded-2xl border border-white/8 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-300 disabled:opacity-50"
                    placeholder="Ex.: Finanças pessoais"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Se deixar vazio, criaremos um workspace automaticamente para voce.
                  </p>
                </div>
              </>
            )}

            {error && <div className="rounded-2xl border border-red-500/50 bg-red-900/20 p-3 text-sm text-red-200">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="brand-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold transition-transform disabled:opacity-50 hover:scale-[1.01]"
            >
              {isLoading
                ? mode === 'login'
                  ? 'Entrando...'
                  : 'Criando conta...'
                : mode === 'login'
                  ? 'Entrar'
                  : 'Criar conta'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            {mode === 'login'
              ? 'Entre com sua conta para acessar seu workspace.'
              : 'Crie sua conta e ja comece com um workspace pronto para usar.'}
          </p>
        </div>
      </div>
    </div>
  );
}
