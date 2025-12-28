'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Typography } from '@/components/shared/ui';
import { Wallet, FileSpreadsheet, Building2 } from 'lucide-react';

const frustrations = [
  {
    icon: Wallet,
    text: 'Llegás a fin de mes sin saber en qué gastaste',
    color: 'var(--color-danger)',
  },
  {
    icon: FileSpreadsheet,
    text: 'Las planillas son un embole y las dejás de usar',
    color: 'var(--color-warning)',
  },
  {
    icon: Building2,
    text: 'Tu banco te muestra todo mezclado e incomprensible',
    color: 'var(--color-info)',
  },
];

export function FrustrationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.4 });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-16 px-6 snap-start"
    >
      {/* Frustraciones */}
      <div className="w-full max-w-3xl space-y-6 mb-12">
        {frustrations.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2, ease: 'easeOut' }}
            className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-strong)] shadow-lg"
          >
            {/* Icono con animación */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 + 0.2, type: 'spring' }}
              className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${item.color}20` }}
            >
              <item.icon
                className="w-6 h-6 md:w-8 md:h-8"
                style={{ color: item.color }}
              />
            </motion.div>

            {/* Texto */}
            <Typography
              variant="body"
              className="text-base md:text-xl text-[var(--text-primary)] font-light"
            >
              {item.text}
            </Typography>

            {/* Línea decorativa */}
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: '100%' } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
              className="hidden md:block absolute right-0 h-[1px] opacity-20"
              style={{ backgroundColor: item.color }}
            />
          </motion.div>
        ))}
      </div>

      {/* Solución */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-center"
      >
        <Typography
          variant="subtitle"
          className="text-xl md:text-2xl font-light text-[var(--text-primary)]"
        >
          Olevium resuelve esto{' '}
          <span className="text-[var(--color-primary)] font-medium">
            sin que tengas que ser contador
          </span>
        </Typography>
      </motion.div>
    </section>
  );
}
