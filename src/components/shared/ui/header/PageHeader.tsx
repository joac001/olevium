import Image from 'next/image';

export default function PageHeader() {
  return (
    <header className="w-full flex justify-center p-4">
      <Image src="/logo-no-bg.svg" alt="Olevium Logo" width={50} height={50} />
    </header>
  );
}
