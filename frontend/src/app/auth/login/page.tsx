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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1e2235] rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-8">Finances</h1>

          <div className="bg-zinc-700/30 rounded-lg p-4 mb-6">
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
            className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1e2235] rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-2">Finances</h1>
          <p className="text-center text-sm text-zinc-400 mb-6">Controle financeiro pessoal</p>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-zinc-900/70 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-purple-600 text-white' : 'text-zinc-400'
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
                mode === 'register' ? 'bg-purple-600 text-white' : 'text-zinc-400'
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
                  className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
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
                className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
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
                className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
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
                    className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
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
                    className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                    placeholder="Ex.: Finanças pessoais"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Se deixar vazio, criaremos um workspace automaticamente para voce.
                  </p>
                </div>
              </>
            )}

            {error && <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors mt-6 flex items-center justify-center gap-2"
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
