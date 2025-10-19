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
import Box from '@/components/shared/ui/content/Box';

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

/** Tokens de estilo basados en tu theme (variables CSS) */
const CONTROL_BASE = [
    'flex w-full items-center justify-between px-3 py-2 text-md md:text-lg transition-all duration-200 ease-in-out',
    'bg-[var(--surface-muted)] border backdrop-blur-sm',
    'focus:outline-none focus:ring-2 focus:ring-[var(--interactive-ring)]',
].join(' ');

const CONTROL_BORDER_OK =
    'border-[var(--border-soft)]';
const CONTROL_BORDER_ERROR = 'border-[var(--color-danger)] hover:border-[var(--color-danger-strong)]';
const CONTROL_DISABLED = 'cursor-not-allowed opacity-50';
const CONTROL_ENABLED = 'cursor-pointer';

const MENU_PANEL_BASE =
    'absolute left-0 right-0 z-50 max-h-60 overflow-y-auto ' +
    'border border-[var(--border-soft)] shadow-xl backdrop-blur-md ' +
    'bg-[var(--card-bg)]';

const OPTION_BASE = 'p-2 md:p-3 text-md md:text-lg text-pretty transition-all duration-150 ease-out text-[color:var(--text-muted)] cursor-pointer';
const OPTION_HOVER = 'hover:bg-[color:var(--color-primary-soft)]/50';
const OPTION_SELECTED = 'bg-[color:var(--color-primary-soft)]/60 text-[color:var(--color-primary-foreground)]';

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
    const [selectedValue, setSelectedValue] = useState<string | number | null>(
        value ?? defaultValue ?? null
    );
    const [selectedLabel, setSelectedLabel] = useState<string>(placeholder);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    const isEmpty = (val: string | number | null): boolean =>
        val === null || val === undefined || val === '';

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
            const option = options.find((opt) => opt.value === val);
            return option ? option.label ?? String(option.value) : placeholder;
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
        setIsOpen((o) => !o);
    };

    // Click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            const idx = options.findIndex((o) => o.value === selectedValue);
            setActiveIndex(idx >= 0 ? idx : 0);
            // pequeño scroll a la opción activa
            requestAnimationFrame(() => {
                const el = listRef.current?.querySelector<HTMLElement>(
                    `[data-index="${idx >= 0 ? idx : 0}"]`
                );
                el?.scrollIntoView({ block: 'nearest' });
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
                setIsOpen((o) => !o);
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
            setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
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

    const controlClasses = [
        CONTROL_BASE,
        isOpen ? 'rounded-t-lg rounded-b-none' : 'rounded-lg',
        isValid ? CONTROL_BORDER_OK : CONTROL_BORDER_ERROR,
        disabled ? CONTROL_DISABLED : CONTROL_ENABLED,
    ].join(' ');

    return (
        <Box className="relative w-full">
            {/* input oculto para FormData */}
            <input
                ref={hiddenInputRef}
                type="hidden"
                name={name}
                value={selectedValue ?? ''}
                required={required}
            />

            {label && (
                <Box className="flex flex-row">
                    <label className="text-md font-medium text-[color:var(--text-primary)]">{label}</label>
                    {required && (
                        <span className="pl-1 text-sm text-[color:var(--color-danger)]">
                            *
                        </span>
                    )}
                </Box>
            )}

            <div ref={dropdownRef}>
                {/* “botón” del select */}
                <div
                    ref={buttonRef}
                    role="button"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    tabIndex={disabled ? -1 : 0}
                    className={controlClasses}
                    onClick={handleToggle}
                    onKeyDown={onControlKeyDown}
                >
                    <span className={selectedValue === null ? 'text-[color:var(--text-muted)]' : 'text-[color:var(--text-primary)]'}>
                        {selectedLabel}
                    </span>
                    <i
                        className={[
                            'fas fa-angle-down text-sm md:text-md transition-all duration-300',
                            isOpen ? 'rotate-180' : '',
                        ].join(' ')}
                    />
                </div>

                {/* lista */}
                {isOpen && !disabled && (
                    <div
                        ref={listRef}
                        role="listbox"
                        aria-activedescendant={activeIndex >= 0 ? `dm-opt-${activeIndex}` : undefined}
                        tabIndex={-1}
                        onKeyDown={onListKeyDown}
                        className={[
                            MENU_PANEL_BASE,
                            isOpen ? 'rounded-b-lg rounded-t-none' : 'rounded-lg',
                        ].join(' ')}
                    >
                        {options.length === 0 ? (
                            <Box className={`${OPTION_BASE} text-center`}>
                                No hay opciones disponibles
                            </Box>
                        ) : (
                            options.map((option, index) => {
                                const selected = selectedValue === option.value;
                                const classes = [
                                    OPTION_BASE,
                                    OPTION_HOVER,
                                    selected ? OPTION_SELECTED : '',
                                ].join(' ');
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
                    </div>
                )}
            </div>

            {!isValid && errorMessage && (
                <Box className="text-xs md:text-md font-light text-[color:var(--color-danger)]">{errorMessage}</Box>
            )}
        </Box>
    );
});

DropMenu.displayName = 'DropMenu';
export default DropMenu;
