'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography } from '@/components/shared/ui';

const questions = [
  '¿A dónde se fue la plata este mes?',
  '¿Por qué siempre llego justo a fin de mes?',
  '¿Cuánto gasté en delivery?',
  '¿En qué se me va el sueldo?',
  '¿Cuánto ahorro por mes?',
  '¿Puedo darme ese gusto?',
  '¿Me alcanza hasta el próximo cobro?',
];

// Posiciones finales para cada pregunta (dispersas alrededor)
const questionPositions = [
  { top: '6%', left: '5%', rotate: -2 },       // Arriba izquierda
  { top: '8%', right: '6%', rotate: 2 },       // Arriba derecha
  { top: '22%', left: '2%', rotate: -1 },      // Medio-arriba izquierda
  { top: '20%', right: '3%', rotate: 1 },      // Medio-arriba derecha
  { bottom: '22%', left: '4%', rotate: -2 },   // Medio-abajo izquierda
  { bottom: '18%', right: '2%', rotate: 2 },   // Medio-abajo derecha
  { bottom: '8%', left: '8%', rotate: 1 },     // Abajo izquierda
];

export function HeroSection() {
  const router = useRouter();
  const [visibleQuestions, setVisibleQuestions] = useState<number[]>([]);
  const [showBrand, setShowBrand] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let currentIndex = 0;

    const showNextQuestion = () => {
      if (currentIndex < questions.length) {
        setVisibleQuestions((prev) => [...prev, currentIndex]);
        currentIndex++;
        setTimeout(showNextQuestion, 200);
      } else {
        setTimeout(() => setShowBrand(true), 250);
      }
    };

    // Iniciar casi inmediatamente
    setTimeout(showNextQuestion, 150);
  }, []);

  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-6 snap-start overflow-hidden">
      {/* Preguntas dispersas alrededor */}
      {questions.map((question, index) => {
        const isVisible = visibleQuestions.includes(index);
        const position = questionPositions[index];

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isVisible ? (showBrand ? 0.3 : 0.5) : 0,
              scale: isVisible ? 1 : 0.8,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              ...position,
              transform: `rotate(${position.rotate}deg)`,
            }}
            className="max-w-xs md:max-w-sm pointer-events-none"
          >
            <Typography
              variant="body"
              className="text-sm md:text-lg font-light text-[var(--text-muted)]"
            >
              {question}
            </Typography>
          </motion.div>
        );
      })}

      {/* Contenido central: Brand y CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showBrand ? 1 : 0, y: showBrand ? 0 : 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showBrand ? 1 : 0, y: showBrand ? 0 : 10 }}
          transition={{ delay: 0.1, duration: 0.4 }}
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
          animate={{ opacity: showBrand ? 1 : 0, y: showBrand ? 0 : 20 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Typography
            variant="h1"
            className="text-5xl md:text-7xl font-light tracking-wide text-[var(--color-primary-light)]"
          >
            Olevium
          </Typography>
        </motion.div>

        {/* Tagline y CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showBrand ? 1 : 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6"
        >
          <Typography
            variant="body"
            className="text-base md:text-lg text-[var(--text-muted)] mb-8 max-w-md mx-auto"
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
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showBrand ? 0.5 : 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
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
