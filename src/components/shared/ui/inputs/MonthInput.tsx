'use client';

import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

import Box from '@/components/shared/ui/content/Box';
import FieldWrapper from './FieldWrapper';

type NativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange'
>;

export interface MonthInputProps extends NativeProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  isValid?: boolean;
  errorMessage?: string | null;
  className?: string;
}

export default function MonthInput({
  label,
  value,
  defaultValue,
  onValueChange,
  required = false,
  disabled = false,
  isValid = true,
  errorMessage = null,
  className,
  id,
  ...rest
}: MonthInputProps) {
  return (
    <FieldWrapper
      label={label}
      required={required}
      disabled={disabled}
      isValid={isValid}
      errorMessage={errorMessage}
    >
      {({ containerClassName, controlClassName, labelId }) => (
        <Box className={containerClassName}>
          <input
            id={id ?? labelId}
            type="month"
            value={value}
            defaultValue={defaultValue}
            onChange={(event) => onValueChange?.(event.target.value)}
            disabled={disabled}
            required={required}
            className={clsx(controlClassName, className)}
            {...rest}
          />
        </Box>
      )}
    </FieldWrapper>
  );
}
