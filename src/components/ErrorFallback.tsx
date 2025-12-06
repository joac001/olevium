'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function ErrorFallback({ message, onRetry }: { message?: string; onRetry: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100 px-4 text-center">
      <h1 className="text-2xl font-semibold">Algo se rompió</h1>
      <p className="text-sm text-slate-400 max-w-md">{message ?? 'Intentá nuevamente o volvé al inicio.'}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="rounded-full bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-brand-900/40"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          Ir al inicio
        </Link>
        <button
          onClick={() => router.back()}
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
}
