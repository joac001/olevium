import Link from 'next/link';
import Image from 'next/image';

import { Container, Box, Card, Typography, ActionButton } from '@/components/shared/ui';

const features = [
  {
    icon: 'fa-wallet',
    eyebrow: 'Cuentas unificadas',
    title: 'Todo tu dinero en un solo lugar',
    description: 'Conectá tus cuentas y tarjetas para ver tu foto financiera completa en segundos.',
  },
  {
    icon: 'fa-chart-line',
    eyebrow: 'Insights automáticos',
    title: 'Detectá patrones y hábitos',
    description:
      'Olevium te muestra tendencias de ingresos y gastos para que sepas exactamente dónde optimizar.',
  },
  {
    icon: 'fa-bullseye',
    eyebrow: 'Objetivos claros',
    title: 'Alineá tus finanzas con tus metas',
    description: 'Definí presupuestos y seguí el avance sin planillas ni fórmulas raras.',
  },
];

export default function LandingPage() {
  return (
    <Container className="relative min-h-[calc(100vh-6rem)] justify-center gap-16 py-12">
      {/* Background decorativo animado */}
      <Box
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -right-32 top-20 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[32rem] -translate-x-1/2 rounded-[999px] bg-gradient-to-r from-emerald-500/10 via-sky-500/15 to-violet-500/10 blur-3xl" />
      </Box>

      <Box className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Box className="space-y-6">
          <Box className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--surface-muted)]/70 shadow-[0_18px_38px_rgba(3,12,32,0.8)] ring-1 ring-[color:var(--border-soft)]">
              <Image
                src="/logo-no-bg.svg"
                alt="Olevium"
                width={32}
                height={32}
                className="drop-shadow-[0_0_18px_rgba(16,185,129,0.75)]"
                priority
              />
            </div>
            <Typography variant="caption" className="text-[color:var(--text-secondary)]">
              Olevium · Asistente financiero inteligente
            </Typography>
          </Box>

          <Typography variant="caption" className="text-[color:var(--text-secondary)]">
            Hecho para personas que quieren dejar de “ver qué pasa a fin de mes”.
          </Typography>

          <Typography variant="h1" className="max-w-2xl leading-tight">
            Ordená tus finanzas sin pelearte con Excel.
          </Typography>

          <Typography variant="body" className="max-w-xl text-[color:var(--text-secondary)]">
            Olevium te ayuda a entender en qué se va tu dinero, planificar mejor y tomar decisiones
            claras para tu futuro financiero. Sin planillas eternas ni dashboards imposibles.
          </Typography>

          <Box className="flex flex-wrap items-center gap-4">
            <Link href="/auth">
              <ActionButton icon="fas fa-right-to-bracket" text="Iniciar sesión o crear cuenta" />
            </Link>
            <Link href="/app">
              <ActionButton
                icon="fas fa-chart-pie"
                type="secondary"
                text="Ver la app en acción"
              />
            </Link>
          </Box>

          <Box className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[color:var(--text-muted)]">
            <span className="inline-flex items-center gap-2">
              <i className="fas fa-shield-alt text-[color:var(--color-success)]" aria-hidden />
              Tus datos se manejan con foco en seguridad y privacidad.
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="fas fa-bolt text-[color:var(--color-accent)]" aria-hidden />
              Empezá en minutos, sin tarjeta de crédito.
            </span>
          </Box>
        </Box>

        <Card
          tone="accent"
          eyebrow="Vista previa del panel"
          title="Un panel pensado para personas reales"
          subtitle="Cuentas, categorías, transacciones y recurrentes en una sola experiencia fluida."
          className="max-w-xl mx-auto animate-rise-soft"
        >
          <Box className="space-y-4 text-sm md:text-base text-[color:var(--text-secondary)]">
            <Box className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)]/60 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-foreground)] shadow-[0_14px_24px_rgba(5,25,40,0.6)]">
                  <i className="fas fa-wallet" aria-hidden />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                    Saldo total
                  </p>
                  <p className="text-lg font-semibold text-[color:var(--text-primary)]">
                    $ 1.254.320
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <i className="fas fa-arrow-trend-up" aria-hidden />
                +12% este mes
              </span>
            </Box>

            <Box className="grid grid-cols-2 gap-3">
              <Box className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)]/60 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  Ingresos
                </p>
                <p className="mt-2 text-sm font-semibold text-emerald-300">+$ 255.000</p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  Sueldos, honorarios y otros.
                </p>
              </Box>
              <Box className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)]/60 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  Gastos
                </p>
                <p className="mt-2 text-sm font-semibold text-rose-300">-$ 198.400</p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  Fijos, variables y extras.
                </p>
              </Box>
            </Box>

            <Box className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)]/60 p-3">
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                Ejemplo de categorías
              </p>
              <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                <li className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">
                  Hogar & servicios
                </li>
                <li className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-200">
                  Salidas & ocio
                </li>
                <li className="rounded-full bg-violet-500/10 px-3 py-1 text-violet-200">
                  Suscripciones
                </li>
                <li className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-200">
                  Transporte
                </li>
              </ul>
            </Box>
          </Box>
        </Card>
      </Box>

      <Box className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            tone="neutral"
            eyebrow={feature.eyebrow}
            title={feature.title}
            className="h-full animate-fade-in-soft"
          >
            <Box className="space-y-3 text-sm text-[color:var(--text-secondary)]">
              <i
                className={`fas ${feature.icon} text-lg text-[color:var(--color-accent)]`}
                aria-hidden
              />
              <p>{feature.description}</p>
            </Box>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
