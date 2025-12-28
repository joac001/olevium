'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Typography } from '@/components/shared/ui';
import { Check, CheckCheck } from 'lucide-react';

export function DemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const timers = [
      setTimeout(() => setStep(1), 500),   // Mostrar mensaje WA
      setTimeout(() => setStep(2), 1800),  // Check enviado
      setTimeout(() => setStep(3), 2500),  // Doble check
      setTimeout(() => setStep(4), 3200),  // Mostrar transacción en app
      setTimeout(() => setStep(5), 4000),  // Actualizar gráfico
    ];

    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-16 px-6 snap-start"
    >
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <Typography
          variant="h2"
          className="text-2xl md:text-4xl font-light text-[var(--color-primary-light)] mb-3"
        >
          Registrar un gasto te toma 3 segundos
        </Typography>
        <Typography variant="body" className="text-[var(--text-muted)]">
          Mandás un mensaje. Nosotros hacemos el resto.
        </Typography>
      </motion.div>

      {/* Demo container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-4xl">
        {/* WhatsApp mockup */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-72 md:w-80"
        >
          {/* Phone frame */}
          <div className="bg-[#0b141a] rounded-3xl p-3 shadow-2xl border border-[var(--border-strong)]">
            {/* Header WA */}
            <div className="bg-[#202c33] rounded-t-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div>
                <div className="text-white text-sm font-medium">Olevium Bot</div>
                <div className="text-[#8696a0] text-xs">en línea</div>
              </div>
            </div>

            {/* Chat area */}
            <div className="bg-[#0b141a] min-h-[280px] p-4 space-y-3 relative overflow-hidden">
              {/* Wallpaper pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              {/* Mensaje del usuario */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={step >= 1 ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex justify-end relative z-10"
              >
                <div className="bg-[#005c4b] rounded-lg rounded-tr-none px-3 py-2 max-w-[80%] shadow">
                  <p className="text-white text-sm">Supermercado 45000</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-[#8696a0]">14:32</span>
                    {step >= 2 && step < 3 && (
                      <Check className="w-4 h-4 text-[#8696a0]" />
                    )}
                    {step >= 3 && (
                      <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Respuesta del bot */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={step >= 4 ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex justify-start relative z-10"
              >
                <div className="bg-[#202c33] rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow">
                  <p className="text-white text-sm">
                    Registrado en <span className="text-[var(--color-primary)]">Alimentación</span>
                  </p>
                  <p className="text-[#8696a0] text-xs mt-1">
                    -$45.000 desde Efectivo
                  </p>
                  <span className="text-[10px] text-[#8696a0] float-right mt-1">14:32</span>
                </div>
              </motion.div>
            </div>

            {/* Input bar */}
            <div className="bg-[#202c33] rounded-b-2xl px-3 py-2 flex items-center gap-2">
              <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
                <span className="text-[#8696a0] text-sm">Mensaje</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={step >= 4 ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4 }}
          className="hidden md:block"
        >
          <svg width="60" height="24" viewBox="0 0 60 24" className="text-[var(--color-primary)]">
            <path
              d="M0 12h50m0 0l-8-8m8 8l-8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </motion.div>

        {/* App mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={step >= 4 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative w-72 md:w-80"
        >
          {/* Phone frame */}
          <div className="bg-[var(--surface-base)] rounded-3xl p-4 shadow-2xl border border-[var(--border-strong)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Typography variant="body" className="text-sm font-medium text-[var(--text-primary)]">
                Transacciones
              </Typography>
              <span className="text-xs text-[var(--text-muted)]">Hoy</span>
            </div>

            {/* Nueva transacción */}
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={step >= 4 ? { opacity: 1, height: 'auto', marginBottom: 12 } : {}}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                      <span className="text-sm">🛒</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">Supermercado</div>
                      <div className="text-xs text-[var(--text-muted)]">Alimentación</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-danger)]">
                    -$45.000
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Otras transacciones */}
            <div className="space-y-2 opacity-50">
              {[
                { emoji: '⛽', name: 'Nafta', cat: 'Transporte', amount: '-$15.000' },
                { emoji: '☕', name: 'Café', cat: 'Alimentación', amount: '-$2.500' },
              ].map((tx, i) => (
                <div key={i} className="p-3 rounded-lg bg-[var(--surface-highlight)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--surface-muted)] flex items-center justify-center">
                        <span className="text-sm">{tx.emoji}</span>
                      </div>
                      <div>
                        <div className="text-sm text-[var(--text-primary)]">{tx.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{tx.cat}</div>
                      </div>
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">{tx.amount}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini gráfico */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={step >= 5 ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="mt-4 p-3 rounded-lg bg-[var(--surface-highlight)]"
            >
              <div className="text-xs text-[var(--text-muted)] mb-2">Gastos del mes</div>
              <div className="flex items-end gap-1 h-12">
                {[40, 25, 60, 35, 80, 45, 90].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={step >= 5 ? { height: `${h}%` } : {}}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`flex-1 rounded-sm ${i === 6 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-primary)]/30'}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
