'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Typography } from '@/components/shared/ui';

export function IntroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.5 });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-between px-8 py-20 snap-start"
    >
      {/* Texto superior */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-2xl text-center pt-12"
      >
        <Typography
          variant="h2"
          className="text-3xl md:text-4xl font-light text-[var(--color-primary-light)]"
        >
          No es más información, es más organización.
        </Typography>
      </motion.div>

      {/* Espacio para el logo en el medio */}
      <div className="flex-1" />

      {/* Texto inferior */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="max-w-2xl text-center pb-12"
      >
        <Typography variant="body" className="text-lg md:text-xl opacity-80 leading-relaxed mb-6">
          Entende tus finanzas personales.
        </Typography>

        <Typography
          variant="body"
          className="text-base md:text-lg font-medium text-[var(--color-primary)]"
        >
          Toma tus decisiones financieras con confianza y claridad.
        </Typography>
      </motion.div>
    </section>
  );
}
