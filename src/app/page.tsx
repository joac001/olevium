import type { Metadata } from 'next';
import { redirectIfAuthenticated } from '@/lib/server-auth';
import LandingContent from '@/app/landing/_components/LandingContent';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.olevium.com';

export const metadata: Metadata = {
  title: 'Olevium — Organizá tus finanzas personales',
  description:
    'Registrá tus gastos en segundos con un mensaje. Sin planillas, sin complicaciones. Tu asistente financiero personal potenciado por IA.',
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: 'Olevium — Organizá tus finanzas personales',
    description:
      'Registrá tus gastos en segundos con un mensaje. Sin planillas, sin complicaciones.',
    type: 'website',
    url: APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Olevium — Organizá tus finanzas personales',
    description:
      'Registrá tus gastos en segundos con un mensaje. Sin planillas, sin complicaciones.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Olevium',
  url: APP_URL,
  description:
    'Asistente financiero personal potenciado por IA. Registrá tus gastos en segundos con un mensaje de WhatsApp.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'ARS',
  },
};

export default async function RootPage() {
  await redirectIfAuthenticated();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingContent />
    </>
  );
}
