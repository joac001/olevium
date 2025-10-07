'use client';

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import Box from "@/components/shared/ui/content/Box";
export type InputType = 'text' | 'email' | 'password' | 'phone' | 'number' | 'date';

const DATE_DISPLAY_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const DATE_ISO_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatDateInput = (rawValue: string): string => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    let formatted = day;

    if (month) {
        formatted = `${formatted}${formatted ? '/' : ''}${month}`;
    }

    if (year) {
        formatted = `${formatted}${formatted ? '/' : ''}${year}`;
    }

    return formatted;
};

const normalizeDateDisplayValue = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) {
        return '';
    }

    const stringValue = String(value).trim();

    if (stringValue === '') {
        return '';
    }

    const isoMatch = DATE_ISO_REGEX.exec(stringValue);
    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return `${day}/${month}/${year}`;
    }

    return formatDateInput(stringValue);
};

const displayDateToIso = (displayValue: string): string | null => {
    const match = DATE_DISPLAY_REGEX.exec(displayValue);
    if (!match) {
        return null;
    }

    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
};

const isValidDisplayDate = (value: string): boolean => {
    const match = DATE_DISPLAY_REGEX.exec(value);
    if (!match) {
        return false;
    }

    const [, dayString, monthString, yearString] = match;
    const day = Number(dayString);
    const month = Number(monthString);
    const year = Number(yearString);

    if (month < 1 || month > 12) {
        return false;
    }

    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};


const validateInput = (value: string | number, type: InputType): boolean => {
    switch (type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value as string);
        case 'phone':
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            return phoneRegex.test(value as string);
        case 'number':
            return !isNaN(Number(value));
        case 'date':
            return typeof value === 'string' && isValidDisplayDate(value);
        case 'text':
            return true;
        case 'password':
            const password = value as string;
            // No permitir espacios
            if (password.includes(' ')) return false;
            // Mínimo 6 caracteres
            if (password.length < 6) return false;
            // Al menos 1 mayúscula
            if (!/[A-Z]/.test(password)) return false;
            // Al menos 1 minúscula
            if (!/[a-z]/.test(password)) return false;
            // Al menos 1 número
            if (!/[0-9]/.test(password)) return false;
            // Al menos 1 símbolo
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
            return true;
        default:
            return true;
    }
}

const isEmpty = (value: string | number): boolean => {
    return value === '' || value === null || value === undefined;
}

const getErrorMessage = (type: InputType, isRequired: boolean = false): string => {
    if (isRequired) {
        return 'Este campo es requerido.';
    }

    switch (type) {
        case 'email':
            return 'El input no es un email válido.';
        case 'phone':
            return 'El input no es un número de teléfono válido.';
        case 'number':
            return 'El input no es un número válido.';
        case 'date':
            return 'La fecha debe tener el formato dd/mm/aaaa y ser válida.';
        case 'password':
            return 'La contraseña debe tener al menos 6 caracteres, sin espacios, con al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (!@#$%^&*(),.?":{}|<>).';
        default:
            return 'Entrada inválida.';
    }
}

interface InputProps {
    type?: InputType;
    value?: string | number;
    name?: string; // Para FormData
    defaultValue?: string | number; // Para formularios no controlados
    // Callback para comunicar cambios de valor al padre
    onValueChange?: (value: string | number) => void;
    // Callback para comunicar estado de validación al padre
    onValidationChange?: (isValid: boolean, errorMessage: string | null) => void;
    // Mensaje de error personalizado que sobrescribe el por defecto
    customErrorMessage?: string | null;
    // Función de validación personalizada
    customValidator?: (value: string | number) => boolean;
    label?: string;
    // Props adicionales del input HTML
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    icon?: string;
    rows?: number;
}

export interface InputRef {
    getValue: () => string | number;
    setValue: (value: string | number) => void;
    validate: () => boolean;
    focus: () => void;
}

const Input = forwardRef<InputRef, InputProps>(({
    value,
    defaultValue,
    name,
    type = 'text' as InputType,
    onValueChange,
    onValidationChange,
    customErrorMessage,
    customValidator,
    label = '',
    placeholder,
    disabled = false,
    required = false,
    icon,
    rows
}, ref) => {

    const initialType = type;
    const [inputType, setInputType] = useState<InputType>(initialType);
    const [inputValue, setInputValue] = useState<string | number>(() => (
        initialType === 'date'
            ? normalizeDateDisplayValue(value ?? defaultValue ?? '')
            : (value ?? defaultValue ?? '')
    ));
    const [isValid, setIsValid] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const hiddenDateInputRef = useRef<HTMLInputElement>(null);

    const disabledClass = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text';
    const inputClass = `w-full p-2 rounded-lg text-[var(--text-primary)] bg-[var(--surface-muted)] focus:outline-none border-2 ${isValid ? `border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--interactive-ring)]` : 'border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]'} ${disabledClass}`;

    // Función para validar el input combinando validación por defecto y personalizada
    const performValidation = useCallback((val: string | number): { isValid: boolean, errorMessage: string | null } => {
        let valid = true;
        let message: string | null = null;

        // Si hay un mensaje de error personalizado, usarlo directamente y marcar como inválido
        if (customErrorMessage !== undefined && customErrorMessage !== null && customErrorMessage !== '') {
            return { isValid: false, errorMessage: customErrorMessage };
        }

        // Verificar si es requerido y está vacío
        if (required && isEmpty(val)) {
            return { isValid: false, errorMessage: getErrorMessage(inputType, true) };
        }

        // Si no está vacío, proceder con validaciones adicionales
        if (!isEmpty(val)) {
            // Validación personalizada tiene prioridad
            if (customValidator) {
                valid = customValidator(val);
                if (!valid) {
                    message = getErrorMessage(inputType);
                }
            } else {
                // Usar validación por defecto
                valid = validateInput(val, inputType);
                if (!valid) {
                    message = getErrorMessage(inputType);
                }
            }
        }

        return { isValid: valid, errorMessage: message };
    }, [customErrorMessage, customValidator, inputType, required]);

    const applyValue = useCallback((rawValue: string | number) => {
        const processedValue = inputType === 'date'
            ? normalizeDateDisplayValue(rawValue)
            : rawValue;

        setInputValue(processedValue);

        const validation = performValidation(processedValue);
        setIsValid(validation.isValid);
        setErrorMessage(validation.errorMessage);

        if (onValueChange) {
            onValueChange(processedValue);
        }

        if (onValidationChange) {
            onValidationChange(validation.isValid, validation.errorMessage);
        }
    }, [inputType, onValidationChange, onValueChange, performValidation]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        applyValue(inputType === 'date' ? formatDateInput(newValue) : newValue);
    };

    // Effect para manejar cambios en props externas
    useEffect(() => {
        const validation = performValidation(inputValue);
        setIsValid(validation.isValid);
        setErrorMessage(validation.errorMessage);
    }, [customErrorMessage, customValidator, inputType, inputValue, performValidation]);

    // Effect separado para notificar cambios de validación
    useEffect(() => {
        if (onValidationChange) {
            const validation = performValidation(inputValue);
            onValidationChange(validation.isValid, validation.errorMessage);
        }
    }, [isValid, errorMessage, onValidationChange, performValidation, inputValue]);

    // Effect para sincronizar valor inicial
    useEffect(() => {
        if (value !== undefined) {
            setInputValue(inputType === 'date' ? normalizeDateDisplayValue(value) : value);
        }
    }, [value, inputType]);

    // Effect para sincronizar tipo de input
    useEffect(() => {
        if (type !== inputType) {
            setInputType(type);
            if (type === 'date') {
                setInputValue(prev => normalizeDateDisplayValue(prev));
            }
        }
    }, [type, inputType]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const openDatePicker = () => {
        if (disabled) {
            return;
        }

        const isoValue = typeof inputValue === 'string' ? displayDateToIso(inputValue) : null;

        const pickerInput = hiddenDateInputRef.current;
        if (pickerInput) {
            pickerInput.value = isoValue ?? '';
            const showPicker = (pickerInput as HTMLInputElement & { showPicker?: () => void }).showPicker;
            if (typeof showPicker === 'function') {
                showPicker.call(pickerInput);
            } else {
                pickerInput.click();
            }
        }
    };

    const handleNativeDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isoValue = event.target.value;
        if (!isoValue) {
            applyValue('');
            return;
        }

        const displayValue = normalizeDateDisplayValue(isoValue);
        applyValue(displayValue);
    };

    // Exponer métodos a través de ref
    useImperativeHandle(ref, () => ({
        getValue: () => inputValue,
        setValue: (newValue: string | number) => {
            if (inputType === 'date') {
                setInputValue(normalizeDateDisplayValue(newValue));
                return;
            }
            setInputValue(newValue);
        },
        validate: () => {
            const validation = performValidation(inputValue);
            setIsValid(validation.isValid);
            setErrorMessage(validation.errorMessage);
            return validation.isValid;
        },
        focus: () => inputRef.current?.focus()
    }));

    const resolvedPlaceholder = inputType === 'date' ? (placeholder ?? 'dd/mm/aaaa') : placeholder;

    const resolvedType = inputType === 'password'
        ? (showPassword ? 'text' : 'password')
        : inputType === 'date'
            ? 'text'
            : inputType;

    return (
        <Box className={`w-full`}>
            <Box className={`flex flex-row ${disabledClass}`}>
                {label && <label className="text-md font-medium md:text-lg text-[var(--text-primary)]">{label}</label>}
                {required && <span className="pl-1 text-sm font-semibold text-[color:var(--color-danger)] sm:text-base md:text-lg">*</span>}
            </Box>
            <Box className={`relative ${disabledClass}`}>
                {!rows && icon && (
                    <Box className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none z-10">
                        <i className={icon} />
                    </Box>
                )}
                {inputType === 'date' && (
                    <input
                        ref={hiddenDateInputRef}
                        type="date"
                        onChange={handleNativeDateChange}
                        className="absolute opacity-0 pointer-events-none w-0 h-0"
                        tabIndex={-1}
                    />
                )}
                {rows && rows > 1 ? (
                    <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        name={name}
                        rows={rows}
                        value={inputValue}
                        onChange={handleChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        className={inputClass}
                    />
                ) : (
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        name={name}
                        type={resolvedType}
                        inputMode={inputType === 'date' ? 'numeric' : undefined}
                        pattern={inputType === 'date' ? "\\d{2}/\\d{2}/\\d{4}" : undefined}
                        value={inputValue}
                        onChange={handleChange}
                        placeholder={resolvedPlaceholder}
                        disabled={disabled}
                        required={required}
                        className={`${icon ? 'pl-10' : ''} ${inputClass} ${(inputType === 'password' || inputType === 'date') ? 'pr-12' : ''}`}
                    />
                )}
                {inputType === 'password' && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] focus:outline-none z-10"
                        disabled={disabled}
                    >
                        {showPassword ? (
                            <i className="fas fa-eye" />
                        ) : (
                            <i className="fas fa-eye-slash" />
                        )}
                    </button>
                )}
                {inputType === 'date' && (
                    <button
                        type="button"
                        onClick={openDatePicker}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] focus:outline-none z-10"
                        disabled={disabled}
                    >
                        <i className="far fa-calendar-alt" />
                    </button>
                )}
            </Box>
            {!isValid && errorMessage && (
                <Box className="text-xs md:text-md font-light text-[color:var(--color-danger)]">
                    {errorMessage}
                </Box>
            )}
        </Box>
    );
});

Input.displayName = 'Input';

export default Input;
