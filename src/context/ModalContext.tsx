'use client';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import ModalWrapper from '@/components/shared/ui/wrappers/ModalWrapper';

interface ModalContextType {
    showModal: (content: ReactNode) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal debe usarse dentro de ModalProvider');
    }

    return {
        showModal: context.showModal,
        hideModal: context.hideModal
    };
};

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode>(null);

    const showModal = useCallback((content: ReactNode) => {
        setModalContent(content);
        setIsOpen(true);
    }, []);

    const hideModal = useCallback(() => {
        setIsOpen(false);
        // Limpiar el contenido después de la transición de cierre
        setTimeout(() => {
            setModalContent(null);
        }, 300);
    }, []);

    return (
        <ModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            <ModalWrapper isOpen={isOpen} onClose={hideModal}>
                {modalContent}
            </ModalWrapper>
        </ModalContext.Provider>
    );
};
