import Link from 'next/link';

export function FloatingActionButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Criar novo"
      className="fixed bottom-20 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-3xl font-light text-black shadow-2xl transition hover:bg-emerald-400 md:bottom-8 md:right-8"
    >
      +
    </Link>
  );
}
