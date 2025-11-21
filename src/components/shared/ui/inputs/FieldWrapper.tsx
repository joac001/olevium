import { ReactNode, useId } from 'react';
import clsx from 'clsx';

import Box from '@/components/shared/ui/content/Box';

interface FieldWrapperRenderProps {
  containerClassName: string;
  controlClassName: string;
  labelId?: string;
  disabled: boolean;
  isValid: boolean;
}

interface FieldWrapperProps {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  isValid?: boolean;
  errorMessage?: string | null;
  children: (props: FieldWrapperRenderProps) => ReactNode;
}

export default function FieldWrapper({
  label,
  required = false,
  disabled = false,
  isValid = true,
  errorMessage = null,
  children,
}: FieldWrapperProps) {
  const generatedId = useId();
  const labelId = label ? generatedId : undefined;

  const containerClassName = clsx(
    'relative',
    disabled ? 'cursor-not-allowed opacity-55' : 'cursor-text'
  );

  const controlClassName = clsx(
    'w-full rounded-2xl border px-4 py-3 text-sm md:text-base transition-all duration-200 ease-out backdrop-blur',
    isValid
      ? 'border-[color:var(--field-border)] bg-[color:var(--field-surface)] text-[color:var(--text-primary)] shadow-[0_28px_52px_-36px_var(--field-shadow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-ring)]'
      : 'border-[color:var(--color-danger)] bg-[color:var(--field-error-surface)] text-[color:var(--color-danger)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]',
    disabled ? 'pointer-events-none opacity-55' : 'hover:-translate-y-px'
  );

  return (
    <Box className="w-full">
      {label && (
        <Box className={clsx('flex items-center gap-1 pb-1', disabled ? 'opacity-55' : undefined)}>
          <label
            htmlFor={labelId}
            className="text-sm font-semibold tracking-[0.18em] text-[color:var(--text-muted)] md:text-base"
          >
            {label}
          </label>
          {required && (
            <span className="text-xs font-semibold text-[color:var(--color-danger)] sm:text-sm">
              *
            </span>
          )}
        </Box>
      )}

      {children({
        containerClassName,
        controlClassName,
        labelId,
        disabled,
        isValid,
      })}

      {!isValid && errorMessage && (
        <Box className="mt-2 text-xs font-semibold text-[color:var(--color-danger)] md:text-sm">
          {errorMessage}
        </Box>
      )}
    </Box>
  );
}
