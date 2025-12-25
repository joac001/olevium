'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Typography } from '@/components/shared/ui';
import { MessageCircle, Shield, Smartphone } from 'lucide-react';

export function PrivacySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.5 });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-20 snap-start"
    >
      {/* Eje vertical */}
      <motion.div
        className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--color-primary)] to-transparent"
        initial={{ opacity: 0.3 }}
        animate={isInView ? { opacity: 0.5 } : { opacity: 0.3 }}
        transition={{ duration: 0.5 }}
      />

      {/* Mensaje principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-3xl mb-6 md:mb-12"
      >
        <h2
          className="text-2xl md:text-5xl font-light mb-3 md:mb-6 leading-tight"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Todo esto sucede en tu cabeza.
        </h2>

        <Typography variant="body" className="text-sm md:text-lg opacity-70 max-w-2xl mx-auto">
          Olevium respeta tu privacidad. No nos conectamos a tu banco ni accedemos a tus cuentas.
          Vos registrás lo que querés, cuando querés.
        </Typography>
      </motion.div>

      {/* Cards de features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 max-w-4xl w-full mt-4 md:mt-8">
        {/* WhatsApp Bot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="p-4 md:p-5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-strong)] text-center"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-2 md:mb-3 rounded-full bg-[var(--color-primary)] bg-opacity-20 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-semibold text-sm mb-1 md:mb-2">Bot de WhatsApp</h3>
          <p className="text-xs opacity-70">
            Registra salidas e ingresos desde tu chat. Sin abrir la app.
          </p>
        </motion.div>

        {/* Privacidad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="p-4 md:p-5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-strong)] text-center"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-2 md:mb-3 rounded-full bg-[var(--color-primary)] bg-opacity-20 flex items-center justify-center">
            <Shield className="w-6 h-6 md:w-7 md:h-7 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-semibold text-sm mb-1 md:mb-2">Sin conexión bancaria</h3>
          <p className="text-xs opacity-70">
            No accedemos a tus cuentas. Tu información es solo tuya.
          </p>
        </motion.div>

        {/* Registro manual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="p-4 md:p-5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-strong)] text-center"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-2 md:mb-3 rounded-full bg-[var(--color-primary)] bg-opacity-20 flex items-center justify-center">
            <Smartphone className="w-6 h-6 md:w-7 md:h-7 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-semibold text-sm mb-1 md:mb-2">Control consciente</h3>
          <p className="text-xs opacity-70">
            Registrás solo lo que considerás relevante. Vos decidís.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
