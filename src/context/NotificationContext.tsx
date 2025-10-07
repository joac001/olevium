'use client';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import NotificationWrapper from '@/components/shared/ui/wrappers/NotificationWrapper';

interface NotificationContextType {
    showNotification: (icon: string, color: string, title: string, description: string) => void;
    hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProps {
    icon: string;
    color: string;
    title: string;
    description: string;
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification debe usarse dentro de NotificationProvider');
    }

    return {
        showNotification: context.showNotification,
        hideNotification: context.hideNotification
    };
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notificationProps, setNotificationProps] = useState<NotificationProps>({} as NotificationProps);
    const [duration, setDuration] = useState<number>(3000);

    const showNotification = useCallback((icon: string, color: string, title: string, description: string) => {
        setNotificationProps({ icon, color, title, description });
        setDuration(3000);
        setIsOpen(true);
    }, []);

    const hideNotification = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            <NotificationWrapper isOpen={isOpen} duration={duration} onClose={hideNotification} props={notificationProps}>
                {children}
            </NotificationWrapper>
        </NotificationContext.Provider>
    );
};
