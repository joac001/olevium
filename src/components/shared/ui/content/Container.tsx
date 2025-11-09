import type { ReactNode } from 'react';
import clsx from 'clsx';
import Box from '@/components/shared/ui/content/Box';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <Box
      className={clsx(
        'mx-auto flex h-full w-full max-w-7xl flex-col gap-6 overflow-y-auto px-4 py-6 md:gap-8 md:px-6 lg:gap-10 lg:px-8',
        className
      )}
    >
      {children}
    </Box>
  );
}
