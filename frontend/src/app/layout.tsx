import type { Metadata } from 'next';
import { AuthGate } from '@/components/auth-gate';
import { PwaRegister } from '@/components/pwa-register';
import { AuthProvider } from '@/services/auth.context';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finances – Controle Financeiro',
  description: 'App de controle financeiro pessoal estilo Mobills',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Finances',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full antialiased">
        <PwaRegister />
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              className: 'border border-white/10 !bg-[rgba(35,35,33,0.95)] !text-zinc-100',
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
