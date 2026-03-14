import type { Metadata } from 'next';
import VerifyCtaContent from './_components/VerifyCtaContent';

export const metadata: Metadata = {
  title: 'Verificar email | Olevium',
};

export default function VerifyCtaPage() {
  return <VerifyCtaContent />;
}
