import type { Metadata } from 'next';
import { redirectIfAuthenticated } from '@/lib/server-auth';
import LandingPage from './landing/page';

export const metadata: Metadata = {
  title: 'Olevium — Organizá tus finanzas personales',
  description:
    'Registrá tus gastos en segundos con un mensaje. Sin planillas, sin complicaciones. Tu asistente financiero personal potenciado por IA.',
  openGraph: {
    title: 'Olevium — Organizá tus finanzas personales',
    description:
      'Registrá tus gastos en segundos con un mensaje. Sin planillas, sin complicaciones.',
    type: 'website',
  },
};

export default async function RootPage() {
  await redirectIfAuthenticated();
  return <LandingPage />;
}
