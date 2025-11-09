import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';

import type { ColorKey } from '@/types/ColorKey';
import ButtonBase from './ButtonBase';

export interface ButtonProps {
  type?: ColorKey;
  text: string;
  disabled?: boolean;
  onClick?: () => void;
  htmlType?: 'button' | 'submit' | 'reset';
  icon?: ReactNode | string;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

export default function Button({
  type,
  text,
  disabled = false,
  onClick,
  htmlType = 'button',
  icon,
  iconPosition = 'start',
  fullWidth = false,
  className,
  style,
  ariaLabel,
}: ButtonProps) {
  const isIconAfter = icon && iconPosition === 'end';
  const buttonStyle: CSSProperties | undefined = type
    ? style
    : {
        backgroundImage:
          'linear-gradient(135deg, color-mix(in srgb, var(--surface-muted) 82%, transparent 18%) 0%, color-mix(in srgb, var(--surface-muted) 60%, transparent 40%) 100%)',
        ...style,
      };

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <i className={clsx(icon, 'text-base md:text-lg')} aria-hidden />;
    }
    return icon;
  };

  return (
    <ButtonBase
      variant={type}
      disabled={disabled}
      onClick={onClick}
      htmlType={htmlType}
      className={className}
      style={buttonStyle}
      fullWidth={fullWidth}
      ariaLabel={ariaLabel ?? text}
      leadingIcon={!isIconAfter ? renderIcon() : undefined}
      trailingIcon={isIconAfter ? renderIcon() : undefined}
    >
      <span className="text-sm font-medium text-pretty md:text-base">{text}</span>
    </ButtonBase>
  );
}
