'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography } from '@/components/shared/ui';

const questions = [
  '¿A dónde se fue la plata este mes?',
  '¿Por qué siempre llego justo a fin de mes?',
  '¿Cuánto gasté en delivery?',
  '¿En qué se me va el sueldo?',
];

export function HeroSection() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showBrand, setShowBrand] = useState(false);

  useEffect(() => {
    if (showBrand) return;

    const interval = setInterval(() => {
      setCurrentQuestion((prev) => {
        if (prev >= questions.length - 1) {
          clearInterval(interval);
          setTimeout(() => setShowBrand(true), 800);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [showBrand]);

  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-6 snap-start overflow-hidden">
      {/* Preguntas animadas */}
      <div className="h-32 flex items-center justify-center mb-8">
        <AnimatePresence mode="wait">
          {!showBrand ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center"
            >
              <Typography
                variant="h2"
                className="text-2xl md:text-4xl font-light text-[var(--text-primary)] opacity-80"
              >
                {questions[currentQuestion]}
              </Typography>
            </motion.div>
          ) : (
            <motion.div
              key="brand"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Typography
                  variant="body"
                  className="text-lg md:text-xl text-[var(--color-primary)] font-medium mb-2"
                >
                  Dejá de adivinar.
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  className="text-5xl md:text-7xl font-light tracking-wide text-[var(--color-primary-light)]"
                >
                  Olevium
                </Typography>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tagline y CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showBrand ? 1 : 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="text-center"
      >
        <Typography
          variant="body"
          className="text-base md:text-lg text-[var(--text-muted)] mb-8 max-w-md"
        >
          Organizá tus finanzas personales sin complicaciones
        </Typography>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button
            type="primary"
            text="Empezar gratis"
            onClick={() => router.push('/auth?mode=register')}
            className="px-8 py-3 text-lg w-full sm:w-auto"
          />
          <button
            onClick={() => router.push('/auth')}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors underline-offset-4 hover:underline"
          >
            Ya tengo cuenta
          </button>
        </div>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showBrand ? 0.5 : 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-[var(--text-muted)]">Descubrí más</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[var(--color-primary)]"
          >
            <path
              d="M12 5v14m0 0l-6-6m6 6l6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
