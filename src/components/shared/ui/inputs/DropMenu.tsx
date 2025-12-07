'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import clsx from 'clsx';

import Box from '@/components/shared/ui/content/Box';
import FieldWrapper from './FieldWrapper';

export interface DropMenuOption {
  value: string | number;
  label?: string;
}

export interface DropMenuProps {
  options: DropMenuOption[];
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  name?: string;
  defaultValue?: string | number | null;
  onValueChange?: (value: string | number | null) => void;
  value?: string | number | null;
  onValidationChange?: (isValid: boolean, errorMessage: string | null) => void;
  required?: boolean;
  customErrorMessage?: string | null;
}

export interface DropMenuRef {
  getValue: () => string | number | null;
  setValue: (value: string | number | null) => void;
  validate: () => boolean;
  focus: () => void;
}

const MENU_PANEL_BASE =
  'z-1300 overflow-y-auto rounded-2xl border shadow-[0_32px_48px_-34px_rgba(3,14,30,0.85)] backdrop-blur-xs font-bold';

const OPTION_BASE =
  'p-2.5 md:p-3 text-sm md:text-base transition-all duration-150 ease-out text-[color:var(--text-secondary)] cursor-pointer';
const OPTION_HOVER = 'hover:bg-[color:var(--field-hover)] hover:text-[color:var(--text-primary)]';
const OPTION_SELECTED = 'bg-[color:var(--field-active)] text-[color:var(--text-primary)]';

const DropMenu = forwardRef<DropMenuRef, DropMenuProps>(function DropMenu(
  {
    options,
    disabled = false,
    placeholder = 'Seleccione una opción',
    label = '',
    name,
    defaultValue,
    onValueChange,
    value,
    onValidationChange,
    required = false,
    customErrorMessage,
  },
  ref
) {
  const [mounted, setMounted] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number | null>(
    value ?? defaultValue ?? null
  );
  const [selectedLabel, setSelectedLabel] = useState<string>(placeholder);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const menuStyle: CSSProperties = {
    backgroundImage:
      'linear-gradient(135deg, color-mix(in srgb, var(--field-surface) 78%, transparent 22%) 0%, color-mix(in srgb, var(--field-surface) 52%, transparent 48%) 100%)',
    borderColor: 'color-mix(in srgb, var(--field-border) 72%, transparent 28%)',
  };
  const isPanelPositioned = typeof panelStyle.top === 'number';
  useEffect(() => {
    setMounted(true);
  }, []);

  const isEmpty = (val: string | number | null): boolean =>
    val === null || val === undefined || val === '';

  const updatePanelPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spacing = 12;
    const spaceBelow = viewportHeight - rect.bottom - spacing;
    const spaceAbove = rect.top - spacing;
    const prefersOpenUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const availableSpace = prefersOpenUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(120, Math.min(320, availableSpace > 0 ? availableSpace : 320));
    const top = prefersOpenUp
      ? Math.max(spacing, rect.top - maxHeight)
      : Math.min(viewportHeight - spacing - 1, rect.bottom);
    setPanelStyle({
      position: 'fixed',
      top,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, []);

  const performValidation = useCallback(
    (val: string | number | null): { isValid: boolean; errorMessage: string | null } => {
      if (customErrorMessage && customErrorMessage !== '') {
        return { isValid: false, errorMessage: customErrorMessage };
      }
      if (required && isEmpty(val)) {
        return { isValid: false, errorMessage: 'Este campo es requerido.' };
      }
      return { isValid: true, errorMessage: null };
    },
    [customErrorMessage, required]
  );

  const getLabelByValue = useCallback(
    (val: string | number | null): string => {
      if (val === null || val === undefined) return placeholder;
      const option = options.find(opt => opt.value === val);
      return option ? (option.label ?? String(option.value)) : placeholder;
    },
    [options, placeholder]
  );

  const handleSelectOption = (option: DropMenuOption) => {
    if (disabled) return;

    setSelectedValue(option.value);
    setSelectedLabel(option.label ?? String(option.value));
    setIsOpen(false);

    const validation = performValidation(option.value);
    setIsValid(validation.isValid);
    setErrorMessage(validation.errorMessage);

    onValueChange?.(option.value);
    // devolver el foco al “botón”
    buttonRef.current?.focus();
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(prev => {
      const next = !prev;
      if (!prev) {
        requestAnimationFrame(updatePanelPosition);
      }
      return next;
    });
  };

  // Click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      if (listRef.current && listRef.current.contains(target)) {
        return;
      }
      if (isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    updatePanelPosition();
    const handleWindowInteraction = () => {
      updatePanelPosition();
    };
    window.addEventListener('resize', handleWindowInteraction);
    window.addEventListener('scroll', handleWindowInteraction, true);
    return () => {
      window.removeEventListener('resize', handleWindowInteraction);
      window.removeEventListener('scroll', handleWindowInteraction, true);
    };
  }, [isOpen, updatePanelPosition]);

  // Controlado desde el padre
  useEffect(() => {
    if (value !== undefined && value !== selectedValue) {
      setSelectedValue(value);
      setSelectedLabel(getLabelByValue(value));
    }
  }, [value, selectedValue, getLabelByValue]);

  // Inicial
  useEffect(() => {
    if (selectedValue !== null) {
      setSelectedLabel(getLabelByValue(selectedValue));
    }
  }, [selectedValue, getLabelByValue]);

  // Validación al cambiar valor
  useEffect(() => {
    const validation = performValidation(selectedValue);
    setIsValid(validation.isValid);
    setErrorMessage(validation.errorMessage);
  }, [selectedValue, performValidation]);

  // Avisar validación al padre
  useEffect(() => {
    onValidationChange?.(isValid, errorMessage);
  }, [isValid, errorMessage, onValidationChange]);

  // Cuando abre, posiciona el índice activo en el seleccionado actual
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex(o => o.value === selectedValue);
      setActiveIndex(idx >= 0 ? idx : 0);
      // pequeño scroll a la opción activa
      requestAnimationFrame(() => {
        const el = listRef.current?.querySelector<HTMLElement>(
          `[data-index="${idx >= 0 ? idx : 0}"]`
        );
        // Evitamos scroll de la página al abrir el menú.
        if (el && listRef.current) {
          listRef.current.scrollTop = el.offsetTop - listRef.current.clientHeight / 2;
        }
      });
    }
  }, [isOpen, options, selectedValue]);

  const onControlKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(o => !o);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const onListKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;
    if (options.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) handleSelectOption(opt);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  // Exponer métodos
  useImperativeHandle(ref, () => ({
    getValue: () => selectedValue,
    setValue: (value: string | number | null) => {
      setSelectedValue(value);
      setSelectedLabel(getLabelByValue(value));
    },
    validate: () => {
      const validation = performValidation(selectedValue);
      setIsValid(validation.isValid);
      setErrorMessage(validation.errorMessage);
      return validation.isValid;
    },
    focus: () => buttonRef.current?.focus(),
  }));

  return (
    <FieldWrapper
      label={label}
      required={required}
      disabled={disabled}
      isValid={isValid}
      errorMessage={errorMessage}
    >
      {({ containerClassName, controlClassName, labelId }) => (
        <Box className="relative w-full">
          <input
            ref={hiddenInputRef}
            type="hidden"
            name={name}
            value={selectedValue ?? ''}
            required={required}
          />

          <div ref={dropdownRef} className={containerClassName}>
            <div
              ref={buttonRef}
              role="button"
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-labelledby={labelId}
              tabIndex={disabled ? -1 : 0}
              className={clsx(
                controlClassName,
                'flex w-full items-center justify-between gap-3',
                isOpen ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl'
              )}
              onClick={handleToggle}
              onKeyDown={onControlKeyDown}
            >
              <span
                className={
                  selectedValue === null
                    ? 'text-[color:var(--text-muted)]'
                    : 'text-[color:var(--text-primary)]'
                }
              >
                {selectedLabel}
              </span>
              <i
                className={clsx(
                  'fas fa-angle-down text-sm md:text-base transition-transform duration-300',
                  isOpen ? 'rotate-180' : ''
                )}
              />
            </div>

            {mounted &&
              isOpen &&
              !disabled &&
              createPortal(
                <div
                  ref={listRef}
                  role="listbox"
                  aria-activedescendant={activeIndex >= 0 ? `dm-opt-${activeIndex}` : undefined}
                  tabIndex={-1}
                  onKeyDown={onListKeyDown}
                  className={clsx(
                    MENU_PANEL_BASE,
                    isOpen ? 'rounded-b-2xl rounded-t-none' : 'rounded-2xl'
                  )}
                  style={{
                    ...menuStyle,
                    ...panelStyle,
                    visibility: isPanelPositioned ? 'visible' : 'hidden',
                  }}
                >
                  {options.length === 0 ? (
                    <Box className={`${OPTION_BASE} text-center`}>No hay opciones disponibles</Box>
                  ) : (
                    options.map((option, index) => {
                      const selected = selectedValue === option.value;
                      const classes = clsx(
                        OPTION_BASE,
                        OPTION_HOVER,
                        selected ? OPTION_SELECTED : ''
                      );
                      return (
                        <div
                          key={`${option.value}-${index}`}
                          id={`dm-opt-${index}`}
                          data-index={index}
                          role="option"
                          aria-selected={selected}
                          className={classes}
                          onClick={() => handleSelectOption(option)}
                        >
                          {option.label || option.value}
                        </div>
                      );
                    })
                  )}
                </div>,
                document.body
              )}
          </div>
        </Box>
      )}
    </FieldWrapper>
  );
});

DropMenu.displayName = 'DropMenu';
export default DropMenu;
