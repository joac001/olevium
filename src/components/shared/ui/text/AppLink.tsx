import type { AnchorHTMLAttributes, ReactNode } from 'react';
import NextLink, { type LinkProps } from 'next/link';
import clsx from 'clsx';

type AppLinkVariant = 'text' | 'unstyled';

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

export interface AppLinkProps extends LinkProps, AnchorProps {
  children: ReactNode;
  className?: string;
  variant?: AppLinkVariant;
}

const variantClasses: Record<AppLinkVariant, string> = {
  text: [
    'inline-flex items-center gap-2 text-sm font-medium',
    'text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]',
    'transition-colors duration-150',
  ].join(' '),
  unstyled: '',
};

export default function AppLink({
  children,
  className,
  variant = 'text',
  ...rest
}: AppLinkProps) {
  return (
    <NextLink className={clsx(variantClasses[variant], className)} {...rest}>
      {children}
    </NextLink>
  );
}
