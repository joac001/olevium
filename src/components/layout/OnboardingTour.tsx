'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { driver } from 'driver.js';

import { useUserTasksQuery } from '@/features/user/queries';
import { useCompleteTutorialMutation } from '@/features/user/mutations';

export default function OnboardingTour() {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/auth');

  const { data: tasks, isSuccess } = useUserTasksQuery({
    enabled: !isAuthRoute,
    retry: false,
    refetchOnMount: 'always',
  });
  const completeTutorial = useCompleteTutorialMutation();
  const hasStarted = useRef(false);
  const completeTutorialRef = useRef(completeTutorial);
  completeTutorialRef.current = completeTutorial;

  const markDone = useCallback(() => {
    completeTutorialRef.current.mutate();
  }, []);

  useEffect(() => {
    if (!isSuccess || !tasks) return;
    if (tasks.is_tutorial_done || hasStarted.current) return;
    hasStarted.current = true;

    const timeout = setTimeout(() => {
      const tourDriver = driver({
        showProgress: true,
        animate: true,
        allowClose: false,
        overlayColor: 'rgba(0, 0, 0, 0.72)',
        stagePadding: 16,
        stageRadius: 16,
        popoverClass: 'olevium-onboarding',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Listo',
        progressText: '{{current}} de {{total}}',
        steps: [
          {
            element: '#onboarding-whatsapp',
            popover: {
              title: 'WhatsApp',
              description:
                'Desde acá podés conectar tu WhatsApp con Olevium. Chatea con Oli y cargá transacciones o crea nuevas cuentas.',
              side: 'left',
              align: 'end',
            },
          },
          {
            element: '#onboarding-menu',
            popover: {
              title: 'Menú de navegación',
              description:
                'Desde el menú podés navegar entre tus cuentas, transacciones, categorías y más.',
              side: 'bottom',
              align: 'start',
              onNextClick: () => {
                markDone();
                tourDriver.destroy();
              },
              onPrevClick: () => {
                tourDriver.movePrevious();
              },
            },
          },
        ],
        onDestroyStarted: () => {
          markDone();
          tourDriver.destroy();
        },
      });

      tourDriver.drive();
    }, 600);

    return () => clearTimeout(timeout);
  }, [isSuccess, tasks, markDone]);

  return null;
}
