import { useCallback, useState } from "react";

import type { InputType } from "./Input";

const DATE_DISPLAY_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validatePhone = (value: string) => /^\+?[1-9]\d{1,14}$/.test(value);
const validatePassword = (value: string) => {
    if (value.includes(" ")) return false;
    if (value.length < 6) return false;
    if (!/[A-Z]/.test(value)) return false;
    if (!/[a-z]/.test(value)) return false;
    if (!/[0-9]/.test(value)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;
    return true;
};

const isDisplayDateValid = (value: string) => {
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

const getErrorMessage = (type: InputType, isRequired: boolean) => {
    if (isRequired) {
        return "Este campo es requerido.";
    }

    switch (type) {
        case "email":
            return "El input no es un email válido.";
        case "phone":
            return "El input no es un número de teléfono válido.";
        case "number":
            return "El input no es un número válido.";
        case "date":
            return "La fecha debe tener el formato dd/mm/aaaa y ser válida.";
        case "password":
            return "La contraseña debe tener al menos 6 caracteres, sin espacios, con al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (!@#$%^&*(),.?\":{}|<>).";
        default:
            return "Entrada inválida.";
    }
};

interface UseFieldValidationConfig {
    type: InputType;
    required?: boolean;
    customErrorMessage?: string | null;
    customValidator?: (value: string | number) => boolean;
}

export interface ValidationResult {
    isValid: boolean;
    errorMessage: string | null;
}

export function useFieldValidation({
    type,
    required = false,
    customErrorMessage = null,
    customValidator,
}: UseFieldValidationConfig) {
    const [state, setState] = useState<ValidationResult>({ isValid: true, errorMessage: null });

    const validate = useCallback((value: string | number): ValidationResult => {
        if (customErrorMessage) {
            return { isValid: false, errorMessage: customErrorMessage };
        }

        const isEmpty = value === "" || value === null || value === undefined;

        if (required && isEmpty) {
            return { isValid: false, errorMessage: getErrorMessage(type, true) };
        }

        if (isEmpty) {
            return { isValid: true, errorMessage: null };
        }

        if (customValidator) {
            const customValid = customValidator(value);
            return customValid
                ? { isValid: true, errorMessage: null }
                : { isValid: false, errorMessage: getErrorMessage(type, false) };
        }

        let isValid = true;
        switch (type) {
            case "email":
                isValid = validateEmail(String(value));
                break;
            case "phone":
                isValid = validatePhone(String(value));
                break;
            case "number":
                isValid = !Number.isNaN(Number(value));
                break;
            case "date":
                isValid = typeof value === "string" && isDisplayDateValid(value);
                break;
            case "password":
                isValid = validatePassword(String(value));
                break;
            default:
                isValid = true;
        }

        return isValid
            ? { isValid: true, errorMessage: null }
            : { isValid: false, errorMessage: getErrorMessage(type, false) };
    }, [customErrorMessage, customValidator, required, type]);

    const commit = useCallback((value: string | number) => {
        const result = validate(value);
        setState(result);
        return result;
    }, [validate]);

    return {
        validationState: state,
        validate: commit,
        silentValidate: validate,
        setValidationState: setState,
    };
}

export { getErrorMessage };
