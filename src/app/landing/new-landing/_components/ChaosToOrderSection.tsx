'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Typography } from '@/components/shared/ui';

const chaosItems = [
  { emoji: '🛵', label: 'PedidosYa', amount: 8500 },
  { emoji: '🎵', label: 'Spotify', amount: 2300 },
  { emoji: '🚗', label: 'Uber', amount: 4200 },
  { emoji: '🛒', label: 'Supermercado', amount: 45000 },
  { emoji: '🍺', label: 'Bar con amigos', amount: 12000 },
  { emoji: '📺', label: 'Netflix', amount: 4500 },
  { emoji: '☕', label: 'Café', amount: 2800 },
  { emoji: '⛽', label: 'Nafta', amount: 25000 },
  { emoji: '💡', label: 'Luz', amount: 18000 },
  { emoji: '📱', label: 'Celular', amount: 8000 },
  { emoji: '🏠', label: 'Alquiler', amount: 180000 },
  { emoji: '🍕', label: 'Delivery pizza', amount: 9500 },
];

const organizedData = [
  { category: 'Hogar', emoji: '🏠', amount: 198000, color: 'var(--color-primary)' },
  { category: 'Delivery', emoji: '🛵', amount: 18000, color: 'var(--color-warning)' },
  { category: 'Transporte', emoji: '🚗', amount: 29200, color: 'var(--color-info)' },
  { category: 'Streaming', emoji: '📺', amount: 6800, color: 'var(--color-secondary)' },
  { category: 'Salidas', emoji: '🍺', amount: 14800, color: 'var(--color-danger)' },
  { category: 'Servicios', emoji: '📱', amount: 26000, color: 'var(--color-success)' },
];

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function AnimatedCounter({ value, isInView }: { value: number; isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1200;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isInView]);

  return <span>{formatAmount(count)}</span>;
}

export function ChaosToOrderSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [showOrder, setShowOrder] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowOrder(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-16 px-4 snap-start overflow-hidden"
    >
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 md:mb-12"
      >
        <Typography
          variant="h2"
          className="text-2xl md:text-4xl font-light text-[var(--color-primary-light)] mb-2"
        >
          De 47 gastos sueltos a 6 categorías claras
        </Typography>
        <Typography variant="body" className="text-[var(--text-muted)]">
          Tu mes entero, organizado automáticamente
        </Typography>
      </motion.div>

      {/* Container principal */}
      <div className="relative w-full max-w-5xl">
        {/* Caos */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: showOrder ? 0.15 : 1 }}
          transition={{ duration: 0.8 }}
          className="relative h-[350px] md:h-[400px]"
        >
          {chaosItems.map((item, index) => {
            const angle = (index / chaosItems.length) * Math.PI * 2;
            const radius = 120 + Math.random() * 60;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.6;
            const rotation = (Math.random() - 0.5) * 30;

            return (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                  rotate: 0,
                }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        scale: 1,
                        x: `calc(50% + ${x}px - 50%)`,
                        y: `calc(50% + ${y}px - 50%)`,
                        rotate: rotation,
                      }
                    : {}
                }
                transition={{
                  duration: 0.6,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div
                  animate={
                    !showOrder
                      ? {
                          y: [0, -3, 0, 3, 0],
                          rotate: [rotation, rotation + 2, rotation, rotation - 2, rotation],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-strong)] shadow-lg whitespace-nowrap"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div className="text-xs">
                    <div className="text-[var(--text-muted)]">{item.label}</div>
                    <div className="text-[var(--color-danger)] font-medium">
                      -{formatAmount(item.amount)}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Orden - superpuesto */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={showOrder ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl px-4">
            {organizedData.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={showOrder ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="p-4 rounded-xl bg-[var(--surface-base)] border border-[var(--border-strong)] shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{category.emoji}</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: category.color }}
                  >
                    {category.category}
                  </span>
                </div>
                <div className="text-lg md:text-xl font-bold text-[var(--color-danger)]">
                  -<AnimatedCounter value={category.amount} isInView={showOrder} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Indicador de transición */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView && !showOrder ? { opacity: 1 } : { opacity: 0 }}
        className="absolute bottom-8 text-center"
      >
        <Typography variant="body" className="text-sm text-[var(--text-muted)]">
          Mirá la magia...
        </Typography>
      </motion.div>
    </section>
  );
}
