import type { Metadata } from 'next';
import { redirectIfAuthenticated } from '@/lib/server-auth';
import LandingContent from './landing/_components/LandingContent';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.olevium.com';

export const metadata: Metadata = {
  title: 'Olevium — Organizá tus finanzas personales',
  description:
    'Registrá tus gastos en segundos con un mensaje. Sin planillas, sin complicaciones. Tu asistente financiero personal potenciado por IA.',
  openGraph: {
    title: 'Olevium — Organizá tus finanzas personales',
    description:
      'Registrá tus gastos en segundos con un mensaje. Sin planillas, sin complicaciones.',
    type: 'website',
    url: APP_URL,
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Olevium — Organizá tus finanzas personales',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Olevium — Organizá tus finanzas personales',
    description:
      'Registrá tus gastos en segundos con un mensaje. Sin planillas, sin complicaciones.',
    images: [`${APP_URL}/og-image.png`],
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
