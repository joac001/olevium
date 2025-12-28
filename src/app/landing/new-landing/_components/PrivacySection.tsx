'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Typography } from '@/components/shared/ui';
import { X, Check } from 'lucide-react';

const items = [
  { positive: false, text: 'Sin conexión a bancos' },
  { positive: false, text: 'Sin acceso a tus cuentas' },
  { positive: true, text: 'Vos decidís qué registrar' },
];

export function PrivacySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[60vh] flex flex-col items-center justify-center py-16 px-6 snap-start"
    >
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <Typography
          variant="h2"
          className="text-2xl md:text-4xl font-light text-[var(--color-primary-light)]"
        >
          Tus datos son tuyos. Punto.
        </Typography>
      </motion.div>

      {/* Items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8"
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
            className="flex items-center gap-3"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                item.positive
                  ? 'bg-[var(--color-success)]/20'
                  : 'bg-[var(--color-danger)]/20'
              }`}
            >
              {item.positive ? (
                <Check className="w-4 h-4 text-[var(--color-success)]" />
              ) : (
                <X className="w-4 h-4 text-[var(--color-danger)]" />
              )}
            </div>
            <Typography
              variant="body"
              className={`text-base md:text-lg ${
                item.positive
                  ? 'text-[var(--color-success)] font-medium'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {item.text}
            </Typography>
          </motion.div>
        ))}
      </motion.div>

      {/* Descripción */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="max-w-xl text-center"
      >
        <Typography variant="body" className="text-sm text-[var(--text-muted)]">
          A diferencia de otras apps, Olevium no accede a tu información bancaria.
          Vos cargás lo que querés, cuando querés.
        </Typography>
      </motion.div>
    </section>
  );
}
