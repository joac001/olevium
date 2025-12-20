'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Smartphone,
  Utensils,
  Wifi,
  Zap,
  ArrowDown,
} from 'lucide-react';
import { Typography } from '@/components/shared/ui';

const chaosItems = [
  { icon: ShoppingCart, label: 'Supermercado', amount: '-62.000' },
  { icon: Car, label: 'Nafta', amount: '-15.000' },
  { icon: Coffee, label: 'Café', amount: '-2.500' },
  { icon: Utensils, label: 'Almuerzo', amount: '-8.500' },
  { icon: Wifi, label: 'Internet', amount: '-22.000' },
  { icon: Smartphone, label: 'Celular', amount: '-18.000' },
  { icon: Zap, label: 'Luz', amount: '-35.000' },
  { icon: Home, label: 'Alquiler', amount: '-180.000' },
];

const organizedData = [
  { category: 'Hogar', amount: '-297.000', items: ['Alquiler', 'Luz', 'Internet'] },
  { category: 'Transporte', amount: '-52.000', items: ['Nafta', 'Uber'] },
  { category: 'Alimentación', amount: '-73.000', items: ['Supermercado', 'Almuerzo', 'Café'] },
  { category: 'Servicios', amount: '-18.000', items: ['Celular', 'Streaming'] },
];

export function ChaosToOrderSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.5 });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-12 md:py-20 px-4 snap-start overflow-hidden"
    >
      {/* Texto explicativo */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-2xl mb-8 md:mb-16"
      >
        <Typography
          variant="h2"
          className="text-2xl md:text-3xl font-light mb-3 md:mb-4 text-[var(--color-primary-light)]"
        >
          Del desorden a la claridad
        </Typography>
        <Typography variant="body" className="text-sm md:text-base opacity-80">
          Comprende el caos de tus gastos.
        </Typography>
      </motion.div>

      {/* Layout mobile: Vertical */}
      <div className="md:hidden w-full max-w-sm space-y-6">
        {/* Caos */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          <Typography variant="body" className="text-xs opacity-50 text-center mb-6">
            Gastos desordenados
          </Typography>
          <div className="relative h-64 w-full">
            {chaosItems.slice(0, 6).map((item, index) => {
              const rotations = [-8, 5, -12, 7, -5, 10];
              const positions = [
                { top: '0%', left: '5%' },
                { top: '15%', right: '8%' },
                { top: '25%', left: '10%' },
                { top: '40%', right: '5%' },
                { top: '55%', left: '15%' },
                { top: '70%', right: '10%' },
              ];
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1, rotate: rotations[index] } : { opacity: 0, scale: 0.9, rotate: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                  style={positions[index]}
                  className="absolute flex items-center gap-2 px-2 py-2 rounded bg-[var(--surface-base)] border border-[var(--border-strong)] shadow-md"
                >
                  <item.icon className="text-[var(--color-primary)] w-4 h-4 flex-shrink-0" />
                  <div className="text-[10px] leading-tight">
                    <div className="opacity-70 truncate">{item.label}</div>
                    <div className={`font-semibold whitespace-nowrap ${item.amount.startsWith('-') ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                      {item.amount}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Flecha */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <ArrowDown className="w-8 h-8 text-[var(--color-primary)]" />
        </motion.div>

        {/* Orden */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="space-y-2"
        >
          <Typography variant="body" className="text-xs opacity-50 text-center mb-3">
            Organizados por categoría
          </Typography>
          {organizedData.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
              className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-strong)]"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-xs text-[var(--color-primary)]">
                  {category.category}
                </div>
                <div className={`font-bold text-xs ${category.amount.startsWith('-') ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                  {category.amount}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {category.items.map(item => (
                  <span
                    key={item}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface-muted)] opacity-70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Layout desktop: Horizontal (original) */}
      <div className="hidden md:block relative w-full max-w-7xl h-[500px]">
        {/* Lado izquierdo: Caos total */}
        <div className="absolute left-4 top-0 bottom-0 w-64">
          {chaosItems.map((item, index) => {
            const rotations = [-12, 8, -5, 10, -8, 6, -10, 4];
            const positions = [
              { top: '5%', left: '0px', zIndex: 8 },
              { top: '12%', left: '30px', zIndex: 7 },
              { top: '28%', left: '10px', zIndex: 6 },
              { top: '38%', left: '40px', zIndex: 5 },
              { top: '52%', left: '5px', zIndex: 4 },
              { top: '60%', left: '35px', zIndex: 3 },
              { top: '75%', left: '15px', zIndex: 2 },
              { top: '85%', left: '25px', zIndex: 1 },
            ];
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -80, rotate: 0 }}
                animate={isInView ? { opacity: 1, x: 0, rotate: rotations[index] } : { opacity: 0, x: -80, rotate: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
                style={{
                  ...positions[index],
                }}
                className="absolute flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-strong)] shadow-lg"
              >
                <item.icon className="text-[var(--color-primary)] w-5 h-5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="opacity-70">{item.label}</div>
                  <div className={`font-semibold whitespace-nowrap ${item.amount.startsWith('-') ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                    {item.amount}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Líneas conectoras */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <motion.line
            x1="25%"
            y1="50%"
            x2="50%"
            y2="50%"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.line
            x1="50%"
            y1="50%"
            x2="75%"
            y2="50%"
            stroke="var(--color-primary)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.7 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        </svg>

        {/* Lado derecho: Todo organizado */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-72 space-y-3">
          {organizedData.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, x: 80 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
              className="p-4 rounded-lg bg-[var(--surface-base)] backdrop-blur-md border border-[var(--border-strong)] shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm text-[var(--color-primary)]">
                  {category.category}
                </div>
                <div className={`font-bold text-sm ${category.amount.startsWith('-') ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                  {category.amount}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {category.items.map(item => (
                  <span
                    key={item}
                    className="text-[10px] px-2 py-1 rounded bg-[var(--surface-muted)] opacity-70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
