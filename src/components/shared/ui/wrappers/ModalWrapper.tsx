"use client";

import React, { ReactNode, useEffect, useState } from "react";

import OverlayBase from "@/components/shared/ui/wrappers/OverlayBase";

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

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    const panelStyle: React.CSSProperties = {
        backdropFilter: "blur(var(--glass-blur, 18px))",
    };

    return (
        <OverlayBase shouldRender={shouldRender} lockScroll>
            <div
                className={`fixed inset-0 z-modal flex items-center justify-center bg-[var(--surface-overlay)] backdrop-blur-md transition-opacity duration-700 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
                onClick={handleOverlayClick}
            >
                <div
                    className={`relative mx-4 w-full max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl text-[color:var(--text-primary)] shadow-2xl transition-all duration-300 ease-in-out ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"}`}
                    style={panelStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-muted)] transition-colors duration-200 hover:bg-[var(--color-info-light)]"
                        aria-label="Cerrar modal"
                    >
                        <i className="fas fa-times text-[color:var(--text-primary)]" />
                    </button>

                    <div className="max-h-[90vh] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </OverlayBase>
    );
};

export default ModalWrapper;
