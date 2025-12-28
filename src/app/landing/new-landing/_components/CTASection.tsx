'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button } from '@/components/shared/ui';
import { Clock, CreditCard, FileText } from 'lucide-react';

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 });
  const router = useRouter();

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-16 px-6 snap-start"
    >
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/10 to-transparent pointer-events-none" />

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl"
      >
        {/* Título */}
        <Typography
          variant="h2"
          className="text-3xl md:text-5xl font-light text-[var(--color-primary-light)] mb-4"
        >
          Empezá hoy. Es gratis, siempre.
        </Typography>

        {/* Garantías */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8"
        >
          {[
            { icon: CreditCard, text: 'Sin tarjeta de crédito' },
            { icon: FileText, text: 'Sin letra chica' },
            { icon: Clock, text: 'Setup en 2 minutos' },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-[var(--text-muted)]"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5, type: 'spring' }}
          className="mb-6"
        >
          <Button
            type="primary"
            text="Crear mi cuenta"
            onClick={() => router.push('/auth?mode=register')}
            className="px-10 py-4 text-lg font-medium shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-primary)]/40 transition-shadow"
          />
        </motion.div>

        {/* Link secundario */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <button
            onClick={() => router.push('/auth')}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors underline-offset-4 hover:underline"
          >
            ¿Ya tenés cuenta? Iniciá sesión
          </button>
        </motion.div>
      </motion.div>

      {/* Footer mínimo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-6 text-center"
      >
        <Typography variant="body" className="text-xs text-[var(--text-muted)] opacity-50">
          Olevium v0.1.2
        </Typography>
      </motion.div>
    </section>
  );
}
