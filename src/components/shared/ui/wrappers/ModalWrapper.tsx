"use client";

import React, { ReactNode, useEffect, useState } from 'react';

interface ModalWrapperProps {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

const ANIMATION_DURATION = 700;

const ModalWrapper: React.FC<ModalWrapperProps> = ({
    children,
    isOpen,
    onClose,
}) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;

        if (isOpen) {
            setShouldRender(true);
            requestAnimationFrame(() => setIsVisible(true));
        } else if (shouldRender) {
            setIsVisible(false);
            timeout = setTimeout(() => setShouldRender(false), ANIMATION_DURATION);
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [isOpen, shouldRender]);
    // Cerrar modal con tecla Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Manejar click en el overlay para cerrar el modal
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    if (!shouldRender) return null;

    const panelStyle: React.CSSProperties = {
        backgroundImage: 'var(--surface)',
        backgroundColor: 'var(--surface-tint)',
        backdropFilter: 'blur(var(--glass-blur, 18px))'
    };

    return (
        <div
            className={`fixed inset-0 z-modal flex items-center justify-center bg-[var(--surface-overlay)] backdrop-blur-md transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`relative max-w-4xl w-full mx-4 max-h-[90vh] bg-transparent text-[color:var(--text-primary)] rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
                style={panelStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-[var(--surface-muted)] hover:bg-[var(--color-info-light)] rounded-full transition-colors duration-200"
                    aria-label="Cerrar modal"
                >
                    <i className="fas fa-times text-[color:var(--text-primary)]"></i>
                </button>

                {/* Contenido del modal con scroll propio */}
                <div className="overflow-y-auto max-h-[90vh] p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModalWrapper;
