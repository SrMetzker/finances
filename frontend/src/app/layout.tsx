import type { Metadata } from 'next';
import { AuthGate } from '@/components/auth-gate';
import { AuthProvider } from '@/services/auth.context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finances – Controle Financeiro',
  description: 'App de controle financeiro pessoal estilo Mobills',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full antialiased">
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
