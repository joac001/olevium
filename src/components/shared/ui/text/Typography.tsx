import type { ElementType, ReactNode } from 'react';
import { createElement } from 'react';
import clsx from 'clsx';

type Variant = 'h1' | 'h2' | 'subtitle' | 'body' | 'link' | 'caption';

interface TypographyProps {
  variant: Variant;
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

interface VariantConfig {
  tag: ElementType;
  className: string;
}

const variantConfig: Record<Variant, VariantConfig> = {
  h1: {
    tag: 'h1',
    className: 'font-semibold text-3xl md:text-4xl lg:text-5xl tracking-tight',
  },
  h2: {
    tag: 'h2',
    className: 'font-semibold text-2xl md:text-3xl tracking-tight',
  },
  subtitle: {
    tag: 'h3',
    className: 'font-semibold text-lg md:text-xl',
  },
  body: {
    tag: 'p',
    className: 'text-base md:text-lg font-normal leading-relaxed',
  },
  link: {
    tag: 'span',
    className: 'inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em]',
  },
  caption: {
    tag: 'p',
    className: 'text-xs md:text-sm font-medium uppercase tracking-[0.24em]',
  },
};

export default function Typography({ variant, children, as, className }: TypographyProps) {
  const config = variantConfig[variant];
  const Component = (as ?? config.tag) as ElementType;

  return createElement(
    Component,
    {
      className: clsx('text-pretty', config.className, className),
    },
    children
  );
}
