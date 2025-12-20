'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

export function FixedLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Glow intensity basado en scroll
  const glowIntensity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [0.6, 1, 0.8, 1, 0.7, 0.5]
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10"
    >
      <motion.div
        className="relative w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 flex items-center justify-center"
        style={{ opacity: glowIntensity }}
      >
        {/* Círculo con glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Logo */}
        <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 z-10">
          <Image
            src="/logo-no-bg.svg"
            alt="Olevium Logo"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Border luminoso */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
}
