'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Card, Typography } from '@/components/shared/ui';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

export function KnowledgeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.5 });
  const [chartKey, setChartKey] = useState(0);

  // Forzar re-render de los gráficos cuando entran en vista
  useEffect(() => {
    if (isInView) {
      setChartKey(prev => prev + 1);
    }
  }, [isInView]);

  // Doughnut chart data
  const doughnutData = useMemo(
    () => ({
      labels: ['Hogar', 'Transporte', 'Alimentación', 'Servicios', 'Ocio', 'Otros'],
      datasets: [
        {
          data: [297000, 52000, 73000, 18000, 35000, 25000],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(163, 163, 163, 0.8)',
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
            'rgb(251, 146, 60)',
            'rgb(236, 72, 153)',
            'rgb(163, 163, 163)',
          ],
          borderWidth: 2,
        },
      ],
    }),
    []
  );

  // Line chart data
  const lineData = useMemo(
    () => ({
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Ingresos',
          data: [450000, 450000, 500000, 480000, 520000, 500000],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'Gastos',
          data: [420000, 440000, 410000, 450000, 430000, 440000],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    }),
    []
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
      delay: 200,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      y: {
        display: false,
      },
      x: {
        display: false,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1800,
      delay: 300,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-8 md:py-20 px-4 snap-start"
    >
      {/* Texto explicativo */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-2xl mb-4 md:mb-16"
      >
        <Typography variant="h2" className="text-xl md:text-3xl font-light mb-2 md:mb-4 text-[var(--color-primary-light)]">
          Entendimiento, no solo datos
        </Typography>
        <Typography variant="body" className="text-xs md:text-base opacity-80">
          Visualiza tendencias, compara períodos y descubre patrones en tus finanzas.
        </Typography>
      </motion.div>

      {/* Grid de insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 max-w-6xl w-full">
        {/* Card 1: Tendencia temporal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <Card className="p-3 md:p-5 bg-[var(--surface-base)] backdrop-blur-md border border-[var(--border-strong)] h-full transition-shadow hover:shadow-xl hover:shadow-[var(--color-primary)]/10">
            <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
              <div className="p-1.5 md:p-3 rounded-lg bg-[var(--color-primary)] bg-opacity-20">
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-xs md:text-base">Flujo mensual</h3>
                <p className="text-[10px] md:text-xs opacity-70 mt-0.5">Ingresos vs Gastos</p>
              </div>
            </div>
            <div className="h-20 md:h-32 mb-1.5 md:mb-3">
              <Line key={`line-${chartKey}`} data={lineData} options={chartOptions} />
            </div>
            <p className="text-[10px] md:text-xs opacity-70">
              Tus ingresos se mantienen estables mientras tus gastos tienen picos en abril.
            </p>
          </Card>
        </motion.div>

        {/* Card 2: Distribución por categoría */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <Card className="p-3 md:p-5 bg-[var(--surface-base)] backdrop-blur-md border border-[var(--border-strong)] h-full transition-shadow hover:shadow-xl hover:shadow-[var(--color-primary)]/10">
            <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
              <div className="p-1.5 md:p-3 rounded-lg bg-[var(--color-primary)] bg-opacity-20">
                <PieChartIcon className="w-4 h-4 md:w-6 md:h-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-xs md:text-base">Gasto por categoría</h3>
                <p className="text-[10px] md:text-xs opacity-70 mt-0.5">Distribución actual</p>
              </div>
            </div>
            <div className="h-20 md:h-32 mb-1.5 md:mb-3 flex items-center justify-center">
              <div className="w-20 h-20 md:w-32 md:h-32">
                <Doughnut key={`doughnut-${chartKey}`} data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
            <p className="text-[10px] md:text-xs opacity-70">
              El 59% de tus gastos se concentran en Hogar y Alimentación.
            </p>
          </Card>
        </motion.div>

        {/* Card 3: Comparación períodos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <Card className="p-3 md:p-5 bg-[var(--surface-base)] backdrop-blur-md border border-[var(--border-strong)] h-full transition-shadow hover:shadow-xl hover:shadow-[var(--color-primary)]/10">
            <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
              <div className="p-1.5 md:p-3 rounded-lg bg-[var(--color-primary)] bg-opacity-20">
                <BarChart3 className="w-4 h-4 md:w-6 md:h-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-xs md:text-base">Comparación mensual</h3>
                <p className="text-[10px] md:text-xs opacity-70 mt-0.5">Este mes vs anterior</p>
              </div>
            </div>
            <div className="flex items-end justify-center gap-4 md:gap-8 h-20 md:h-32 mb-1.5 md:mb-3">
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  className="w-10 md:w-16 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg"
                  initial={{ height: 0 }}
                  animate={isInView ? { height: '50px' } : { height: 0 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                />
                <span className="text-[10px] md:text-xs opacity-70 font-medium">Ant</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  className="w-10 md:w-16 bg-gradient-to-t from-red-600 to-red-500 rounded-t-lg"
                  initial={{ height: 0 }}
                  animate={isInView ? { height: '58px' } : { height: 0 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                />
                <span className="text-[10px] md:text-xs opacity-70 font-medium">Act</span>
              </div>
            </div>
            <p className="text-[10px] md:text-xs opacity-70">
              Gastaste $35.000 más este mes. Principalmente en Servicios.
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
