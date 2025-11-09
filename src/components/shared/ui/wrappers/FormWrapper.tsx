'use client';
import React, {
  FormEvent,
  ReactNode,
  useRef,
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  JSXElementConstructor,
} from 'react';
import Button, { ButtonProps } from '@/components/shared/ui/buttons/Button';
import Box from '@/components/shared/ui/content/Box';
import { InputRef } from '@/components/shared/ui/inputs/Input';
import { DropMenuRef } from '@/components/shared/ui/inputs/DropMenu';
import Typography from '../text/Typography';

interface FormWrapperProps {
  children: ReactNode;
  onSubmit: (formData: FormData) => void | Promise<void>;
  buttons: Array<ButtonProps>;
  onError?: (error: Error) => void;
  className?: string;
  title?: string;
}

export default function FormWrapper({
  children,
  onSubmit,
  buttons,
  onError,
  className = '',
  title,
}: FormWrapperProps) {
  const formFieldRefs = useRef<(InputRef | DropMenuRef | null)[]>([]);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar todos los campos personalizados primero
    let hasErrors = false;
    let firstErrorMessage = '';

    for (const fieldRef of formFieldRefs.current) {
      if (fieldRef && typeof fieldRef.validate === 'function') {
        const isValid = fieldRef.validate();
        if (!isValid && !hasErrors) {
          hasErrors = true;
          // Obtener el primer error para mostrarlo
          firstErrorMessage =
            'Hay errores en el formulario. Por favor, revisa los campos marcados.';
        }
      }
    }

    // Si hay errores en los campos personalizados, no continuar
    if (hasErrors) {
      if (onError) {
        onError(new Error(firstErrorMessage));
      }
      return;
    }

    // Check if form is valid using HTML5 validation
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
    } catch (error) {
      const formError = error instanceof Error ? error : new Error('Unknown form error');
      if (onError) {
        onError(formError);
      } else {
        console.error('Form submission error:', formError);
      }
    }
  };

  const hasSubmitButton = buttons.some(button => button.htmlType === 'submit');

  if (!hasSubmitButton) {
    throw new Error('FormWrapper requires at least one submit button');
  }

  // Función para clonar children y asignar refs
  type FormFieldRef = InputRef | DropMenuRef;

  type FormFieldElement = ReactElement<{ ref?: React.Ref<FormFieldRef>; children?: ReactNode }>;

  const isFormFieldElement = (element: ReactElement): element is FormFieldElement => {
    if (typeof element.type === 'string') {
      return false;
    }

    const elementType = element.type as JSXElementConstructor<Record<string, unknown>> & {
      displayName?: string;
    };
    return elementType.displayName === 'Input' || elementType.displayName === 'DropMenu';
  };

  const hasChildrenProp = (
    element: ReactElement
  ): element is ReactElement<{ children?: ReactNode }> => {
    return (
      typeof element.props === 'object' && element.props !== null && 'children' in element.props
    );
  };

  const renderChildren = (children: ReactNode): ReactNode => {
    let refIndex = 0;

    const cloneChild = (child: ReactNode): ReactNode => {
      if (!isValidElement(child)) {
        return child;
      }

      // Si es un Input o DropMenu, asignar ref
      if (isFormFieldElement(child)) {
        const currentRefIndex = refIndex++;
        return cloneElement(child, {
          ref: (ref: FormFieldRef | null) => {
            formFieldRefs.current[currentRefIndex] = ref;
          },
        });
      }

      // Si tiene children, procesarlos recursivamente
      if (hasChildrenProp(child)) {
        return cloneElement(child, {
          children: Children.map(child.props.children, cloneChild),
        });
      }

      return child;
    };

    return Children.map(children, cloneChild);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {title && <Typography variant="h2">{title}</Typography>}
      {renderChildren(children)}

      <Box className="flex justify-evenly mt-4">
        {buttons.map((button, index) => (
          <Button
            key={index}
            type={button.type || 'primary'}
            text={button.text}
            htmlType={button.htmlType}
            disabled={button.disabled}
            onClick={button.onClick}
          />
        ))}
      </Box>
    </form>
  );
}
