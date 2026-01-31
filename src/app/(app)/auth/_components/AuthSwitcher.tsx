'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Box, ButtonBase, Card } from '@/components/shared/ui';
import type { ColorKey } from '@/types/ColorKey';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

type AuthView = 'login' | 'signup';

interface ViewConfig {
  tone: ColorKey;
  title: string;
  subtitle: string;
}

const VIEW_COPY: Record<AuthView, ViewConfig> = {
  login: {
    tone: 'neutral',
    title: 'Iniciar sesión',
    subtitle: 'Ingresa a tu panel financiero inteligente.',
  },
  signup: {
    tone: 'neutral',
    title: 'Crear cuenta',
    subtitle: 'Regístrate para preparar tu espacio financiero.',
  },
};

const TAB_ORDER: AuthView[] = ['login', 'signup'];

function getInitialView(mode: string | null): AuthView {
  if (mode === 'register' || mode === 'signup') return 'signup';
  return 'login';
}

export default function AuthSwitcher() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode');
  const [activeView, setActiveView] = useState<AuthView>(() => getInitialView(initialMode));

  const copy = useMemo(() => VIEW_COPY[activeView], [activeView]);

  return (
    <Card tone={copy.tone} title={copy.title} subtitle={copy.subtitle} className="h-full">
      <Box className="flex flex-col gap-6">
        <Box className="grid grid-cols-2 gap-3">
          {TAB_ORDER.map(tab => {
            const isActive = tab === activeView;
            const label = tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta';
            return (
              <ButtonBase
                key={tab}
                variant={isActive ? copy.tone : 'secondary'}
                htmlType="button"
                fullWidth
                aria-label={label}
                aria-pressed={isActive}
                onClick={() => setActiveView(tab)}
                className={isActive ? 'font-semibold' : undefined}
              >
                {label}
              </ButtonBase>
            );
          })}
        </Box>

        {activeView === 'login' ? <LoginForm /> : <SignupForm />}
      </Box>
    </Card>
  );
}
