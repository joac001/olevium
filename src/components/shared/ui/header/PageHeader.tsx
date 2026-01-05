'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PageHeader() {
  const router = useRouter();

  return (
    <header className="w-full flex justify-center p-4">
      <button
        onClick={() => router.push('/')}
        aria-label="Ir al inicio"
        className="focus:outline-none"
      >
        <Image src="/logo-no-bg.svg" alt="Olevium Logo" width={50} height={50} />
      </button>
    </header>
  );
}
