'use client';

import { useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';

import { Box, Card, Typography, Button, ActionButton, Input } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { useModal } from '@/context/ModalContext';
import { postFeedback } from '@/lib/api';

type FeedbackType = 'bug' | 'feature' | 'other';

function FeedbackModalContent() {
  const [type, setType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pathname = usePathname();
  const { showSuccess, showError } = useNotification();
  const { hideModal } = useModal();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    const trimmedDetails = details.trim();

    try {
      setIsSubmitting(true);
      const metadata =
        typeof window !== 'undefined'
          ? {
              technical: {
                userAgent: window.navigator.userAgent,
                language: window.navigator.language,
                platform: window.navigator.platform,
                viewport: {
                  width: window.innerWidth,
                  height: window.innerHeight,
                },
                url: window.location.href,
                appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
              },
              user_context: trimmedDetails
                ? {
                    notes: trimmedDetails,
                  }
                : undefined,
            }
          : trimmedDetails
            ? {
                user_context: {
                  notes: trimmedDetails,
                },
              }
            : undefined;

      await postFeedback({
        type,
        message: trimmed,
        page_path: pathname || '/',
        metadata,
      });
      showSuccess('Gracias por tu feedback', {
        operation: 'create',
        resource: 'feedback',
        userFriendlyOperation: 'feedback',
      });
      hideModal();
    } catch (error) {
      showError(error, {
        operation: 'create',
        resource: 'feedback',
        userFriendlyOperation: 'feedback',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card tone="accent" title="Enviar feedback">
      <Box className="space-y-4">
        <Typography variant="body" className="text-[color:var(--text-muted)]">
          Contanos qué problema encontraste o qué te gustaría mejorar. Si podés, explica de la
          manera más detallada posible qué estabas haciendo y qué esperabas que pasara.
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Box className="flex flex-wrap gap-2">
            {[
              { value: 'bug', label: 'Tengo un problema' },
              { value: 'feature', label: 'Quiero proponer una mejora' },
              { value: 'other', label: 'Otro comentario' },
            ].map(option => (
              <ActionButton
                key={option.value}
                icon={type === option.value ? 'fas fa-check-circle' : 'fas fa-circle'}
                type={type === option.value ? 'accent' : 'neutral'}
                text={option.label}
                onClick={() => setType(option.value as FeedbackType)}
                className="flex-1"
              />
            ))}
          </Box>

          <Box className="space-y-1">
            <Input
              label="Tu mensaje"
              value={message}
              onValueChange={value => setMessage(String(value ?? ''))}
              placeholder="Ej: Estaba creando una cuenta nueva y al guardar me apareció un error sin mensaje."
              rows={4}
              required
            />
          </Box>

          <Box className="flex justify-end gap-2">
            <Button text="Cancelar" onClick={hideModal} type="neutral" htmlType="button" />
            <Button
              text={isSubmitting ? 'Enviando...' : 'Enviar'}
              disabled={isSubmitting || !message.trim()}
              htmlType="submit"
              icon="fas fa-paper-plane"
              iconPosition="end"
            />
          </Box>
        </form>
      </Box>
    </Card>
  );
}

export default function FeedbackWidget() {
  const { showModal } = useModal();

  const handleOpenFeedback = () => {
    showModal(<FeedbackModalContent />);
  };

  return (
    <ActionButton
      icon="fas fa-message"
      type="accent"
      tooltip="Enviar feedback"
      onClick={handleOpenFeedback}
      className="fixed bottom-4 right-4 z-[1100] h-11 w-11 rounded-full shadow-lg"
    />
  );
}
