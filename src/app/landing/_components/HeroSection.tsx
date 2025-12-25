'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, Typography } from '@/components/shared/ui';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative h-screen flex flex-col items-center justify-between py-16 snap-start">
      {/* Título superior */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-20"
      >
        <Typography
          variant="h1"
          className="text-6xl md:text-7xl font-light tracking-wide text-center text-[var(--color-primary-light)]"
        >
          Olevium
        </Typography>
      </motion.div>

      {/* Botones centrados (debajo del logo fijo) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 mb-8 mt-56 md:mt-64 items-center px-8 w-full sm:w-auto"
      >
        <Button
          type="neutral"
          text="Iniciar sesión"
          onClick={() => router.push('/auth')}
          className="px-8 py-3 text-lg border border-[var(--border-strong)] w-full sm:w-auto"
        />
        <Button
          type="primary"
          text="Crear cuenta"
          onClick={() => router.push('/auth')}
          className="px-8 py-3 text-lg w-full sm:w-auto"
        />
      </motion.div>

      {/* Flecha hacia abajo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mb-8"
      >
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ChevronDown size={40} className="opacity-50 text-[var(--color-primary)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
