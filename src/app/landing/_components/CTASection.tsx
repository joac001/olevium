'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button, Typography } from '@/components/shared/ui';
import { useRouter } from 'next/navigation';

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.5 });
  const router = useRouter();

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-start px-8 py-20 snap-start"
    >
      {/* Mensaje principal */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center pt-12"
      >
        <Typography
          variant="h2"
          className="text-3xl md:text-4xl font-light mb-6 text-[var(--color-primary-light)]"
        >
          Comienza a organizar tus finanzas con Olevium.
        </Typography>

        <Typography
          variant="body"
          className="text-base md:text-lg opacity-70 mb-8 max-w-2xl mx-auto"
        >
          Registrate y empezá a usar Olevium hoy mismo. Es completamente gratis.
        </Typography>

        <Button
          type="primary"
          text="Regístrate gratis"
          className="px-10 py-4 text-lg"
          onClick={() => router.push('/auth')}
        />
      </motion.div>
    </section>
  );
}
