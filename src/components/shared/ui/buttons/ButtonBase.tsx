import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';

import type { ColorKey } from '@/types/ColorKey';

export interface ButtonBaseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'color'> {
  variant?: ColorKey;
  htmlType?: 'button' | 'submit' | 'reset';
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  style?: CSSProperties;
  ariaLabel?: string;
}

export default function ButtonBase({
  variant,
  leadingIcon,
  trailingIcon,
  children,
  disabled = false,
  onClick,
  htmlType = 'button',
  className,
  fullWidth = false,
  style,
  ariaLabel,
  ...rest
}: ButtonBaseProps) {
  const handleClick = disabled ? undefined : onClick;

  return (
    <button
      type={htmlType}
      data-variant={variant ?? undefined}
      className={clsx(
        'inline-flex select-none items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--btn-hover)] px-3.5 py-2 text-sm font-medium leading-none',
        'transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-ring)]',
        variant
          ? 'bg-[var(--btn-bg)] bg-[image:var(--btn-bg-gradient)] text-[color:var(--btn-foreground,var(--text-primary))] hover:bg-[var(--btn-hover)]'
          : 'text-[color:var(--text-primary)] backdrop-blur-md',
        disabled
          ? 'cursor-not-allowed opacity-55'
          : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-20px_var(--shadow-soft)] active:translate-y-0',
        fullWidth ? 'w-full' : 'w-fit',
        'md:px-4 md:py-2.5 md:text-base',
        className
      )}
      style={style}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
