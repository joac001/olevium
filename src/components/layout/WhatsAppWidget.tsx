'use client';

import { useState, useRef, useEffect } from 'react';
import { RefreshCw, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import { ActionButton } from '@/components/shared/ui';
import {
  useCreateChatTokenMutation,
  useRegenerateChatTokenMutation,
} from '@/features/user/mutations';
import { useNotification } from '@/context/NotificationContext';
import { useAuthStore } from '@/lib/stores/auth';
import { tokenStorage } from '@/lib/utils/tokenStorage';

const CHAT_TOKEN_STORAGE_KEY = 'olevium_chat_token';
const WA_NUMBER = '5491173630703';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z" />
    </svg>
  );
}

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showError } = useNotification();

  const storeToken = useAuthStore(state => state.accessToken);
  // El store arranca vacío hasta que se hidrata — leemos las cookies como fallback
  const isAuthenticated = Boolean(storeToken || tokenStorage.read().accessToken);

  const createToken = useCreateChatTokenMutation();
  const regenerateToken = useRegenerateChatTokenMutation();

  // Si la sesión expira mientras el widget está abierto, cerrarlo
  useEffect(() => {
    if (!isAuthenticated) setIsOpen(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getOrCreateToken = async (): Promise<string> => {
    // Si ya tenemos token en localStorage, regeneramos directamente
    const stored = localStorage.getItem(CHAT_TOKEN_STORAGE_KEY);
    if (stored) {
      const result = await regenerateToken.mutateAsync();
      const token = result.chat_token;
      localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, token);
      return token;
    }

    // Sin token en localStorage: intentamos crear; si falla (p.ej. conflicto
    // porque ya existe en el backend), intentamos regenerar
    try {
      const result = await createToken.mutateAsync();
      const token = result.chat_token;
      localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, token);
      return token;
    } catch {
      const result = await regenerateToken.mutateAsync();
      const token = result.chat_token;
      localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, token);
      return token;
    }
  };

  const handleGenerateToken = async () => {
    // iOS Safari blocks window.open() from async contexts — must open synchronously
    // within the user gesture, then navigate once the token is ready.
    const newWindow = window.open('', '_blank');
    try {
      const token = await getOrCreateToken();
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola mi token es ct-${token}`)}`;
      if (newWindow) {
        newWindow.location.href = url;
      }
      setIsOpen(false);
    } catch (error) {
      newWindow?.close();
      showError(error, {
        operation: 'create',
        resource: 'token',
        userFriendlyOperation: 'generar token',
      });
    }
  };

  const handleChat = () => {
    window.open(`https://wa.me/${WA_NUMBER}`, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const isLoading = createToken.isPending || regenerateToken.isPending;

  const actions = [
    {
      key: 'token',
      text: 'Generar token',
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: handleGenerateToken,
      disabled: isLoading,
    },
    {
      key: 'chat',
      text: 'Chatear',
      icon: <MessageCircle className="h-4 w-4" />,
      onClick: handleChat,
      disabled: false,
    },
  ];

  return (
    <div ref={containerRef} className="flex flex-col items-end gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div className="flex flex-col items-end gap-2">
            {actions.map((action, i) => (
              <motion.div
                key={action.key}
                initial={{ opacity: 0, y: 10, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    delay: (actions.length - 1 - i) * 0.08,
                    duration: 0.22,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  scale: 0.9,
                  transition: { delay: i * 0.04, duration: 0.13 },
                }}
              >
                <ActionButton
                  icon={action.icon}
                  type="success"
                  text={action.text}
                  alwaysShowText
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="shadow-lg"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <ActionButton
        icon={<WhatsAppIcon className="h-5 w-5" />}
        type="success"
        tooltip="WhatsApp"
        onClick={() => {
          if (!isAuthenticated) {
            window.open(`https://wa.me/${WA_NUMBER}`, '_blank', 'noopener,noreferrer');
            return;
          }
          setIsOpen(prev => !prev);
        }}
        className={clsx(
          'h-11 w-11 rounded-full shadow-lg transition-shadow',
          isOpen && 'ring-2 ring-(--color-success) ring-offset-2 ring-offset-background'
        )}
      />
    </div>
  );
}
