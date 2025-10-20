'use client';

import {
    useEffect,
    useState,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useRef,
} from "react";
import clsx from "clsx";

import Box from "@/components/shared/ui/content/Box";
import FieldWrapper from "./FieldWrapper";
import { useFieldValidation } from "./useFieldValidation";

export type InputType = "text" | "email" | "password" | "phone" | "number" | "date";

const DATE_DISPLAY_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const DATE_ISO_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatDateInput = (rawValue: string): string => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 8);
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    let formatted = day;

    if (month) {
        formatted = `${formatted}${formatted ? "/" : ""}${month}`;
    }

    if (year) {
        formatted = `${formatted}${formatted ? "/" : ""}${year}`;
    }

    return formatted;
};

const normalizeDateDisplayValue = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) {
        return "";
    }

    const stringValue = String(value).trim();

    if (stringValue === "") {
        return "";
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

interface InputProps {
    type?: InputType;
    value?: string | number;
    name?: string;
    defaultValue?: string | number;
    onValueChange?: (value: string | number) => void;
    onValidationChange?: (isValid: boolean, errorMessage: string | null) => void;
    customErrorMessage?: string | null;
    customValidator?: (value: string | number) => boolean;
    label?: string;
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
    type = "text",
    onValueChange,
    onValidationChange,
    customErrorMessage,
    customValidator,
    label = "",
    placeholder,
    disabled = false,
    required = false,
    icon,
    rows,
}, ref) => {
    const [inputType, setInputType] = useState<InputType>(type);
    const [inputValue, setInputValue] = useState<string | number>(() => (
        type === "date"
            ? normalizeDateDisplayValue(value ?? defaultValue ?? "")
            : (value ?? defaultValue ?? "")
    ));
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const hiddenDateInputRef = useRef<HTMLInputElement>(null);

    const {
        validationState,
        silentValidate,
        validate: commitValidation,
        setValidationState,
    } = useFieldValidation({
        type: inputType,
        required,
        customErrorMessage,
        customValidator,
    });

    const syncValidation = useCallback((val: string | number) => {
        const next = silentValidate(val);
        setValidationState(next);
        return next;
    }, [silentValidate, setValidationState]);

    const syncInputValue = useCallback((rawValue: string | number, localType: InputType = inputType) => {
        const processed = localType === "date"
            ? normalizeDateDisplayValue(rawValue)
            : rawValue;
        setInputValue(processed);
        syncValidation(processed);
    }, [inputType, syncValidation]);

    const applyValue = useCallback((rawValue: string | number) => {
        const processed = inputType === "date"
            ? formatDateInput(String(rawValue))
            : rawValue;
        setInputValue(processed);
        syncValidation(processed);
        onValueChange?.(processed);
    }, [inputType, onValueChange, syncValidation]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = event.target.value;
        applyValue(newValue);
    };

    useEffect(() => {
        if (value !== undefined) {
            syncInputValue(value);
        }
    }, [value, syncInputValue]);

    useEffect(() => {
        if (type !== inputType) {
            setInputType(type);
            syncInputValue(value ?? inputValue, type);
        }
    }, [type, inputType, value, inputValue, syncInputValue]);

    useEffect(() => {
        onValidationChange?.(validationState.isValid, validationState.errorMessage);
    }, [validationState, onValidationChange]);

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const openDatePicker = () => {
        if (disabled) {
            return;
        }

        const isoValue = typeof inputValue === "string" ? displayDateToIso(inputValue) : null;

        const pickerInput = hiddenDateInputRef.current;
        if (pickerInput) {
            pickerInput.value = isoValue ?? "";
            const showPicker = (pickerInput as HTMLInputElement & { showPicker?: () => void }).showPicker;
            if (typeof showPicker === "function") {
                showPicker.call(pickerInput);
            } else {
                pickerInput.click();
            }
        }
    };

    const handleNativeDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isoValue = event.target.value;
        if (!isoValue) {
            applyValue("");
            return;
        }

        const displayValue = normalizeDateDisplayValue(isoValue);
        applyValue(displayValue);
    };

    useImperativeHandle(ref, () => ({
        getValue: () => inputValue,
        setValue: (newValue: string | number) => {
            syncInputValue(newValue);
        },
        validate: () => {
            const result = commitValidation(inputValue);
            return result.isValid;
        },
        focus: () => inputRef.current?.focus(),
    }));

    const resolvedPlaceholder = inputType === "date" ? (placeholder ?? "dd/mm/aaaa") : placeholder;

    const resolvedType = inputType === "password"
        ? (showPassword ? "text" : "password")
        : inputType === "date"
            ? "text"
            : inputType;

    return (
        <FieldWrapper
            label={label}
            required={required}
            disabled={disabled}
            isValid={validationState.isValid}
            errorMessage={validationState.errorMessage}
        >
            {({ containerClassName, controlClassName, labelId }) => (
                <Box className={containerClassName}>
                    {!rows && icon && (
                        <Box className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[color:var(--text-muted)] md:left-4">
                            <i className={icon} />
                        </Box>
                    )}
                    {inputType === "date" && (
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
                            id={labelId}
                            name={name}
                            rows={rows}
                            value={String(inputValue)}
                            onChange={handleChange}
                            placeholder={placeholder}
                            disabled={disabled}
                            required={required}
                            className={controlClassName}
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            id={labelId}
                            name={name}
                            type={resolvedType}
                            inputMode={inputType === "date" ? "numeric" : undefined}
                            pattern={inputType === "date" ? "\\d{2}/\\d{2}/\\d{4}" : undefined}
                            value={String(inputValue)}
                            onChange={handleChange}
                            placeholder={resolvedPlaceholder}
                            disabled={disabled}
                            required={required}
                            className={clsx(
                                icon ? "pl-11 md:pl-12" : "",
                                controlClassName,
                                (inputType === "password" || inputType === "date") ? "pr-14" : "",
                            )}
                        />
                    )}
                    {inputType === "password" && (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-ring)]"
                            disabled={disabled}
                        >
                            {showPassword ? (
                                <i className="fas fa-eye" />
                            ) : (
                                <i className="fas fa-eye-slash" />
                            )}
                        </button>
                    )}
                    {inputType === "date" && (
                        <button
                            type="button"
                            onClick={openDatePicker}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-ring)]"
                            disabled={disabled}
                        >
                            <i className="far fa-calendar-alt" />
                        </button>
                    )}
                </Box>
            )}
        </FieldWrapper>
    );
});

Input.displayName = "Input";

export default Input;
