'use client';

import { useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { Bug, Lightbulb, Send, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

import { Box, Card, Typography, Button, ActionButton, Input } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { useModal } from '@/context/ModalContext';
import { postFeedback } from '@/lib/api';

type FeedbackType = 'bug' | 'feature' | 'other';

const FEEDBACK_TYPES: { value: FeedbackType; label: string; icon: React.ReactNode }[] = [
  { value: 'bug', label: 'Problema', icon: <Bug className="h-4 w-4" /> },
  { value: 'feature', label: 'Mejora', icon: <Lightbulb className="h-4 w-4" /> },
  { value: 'other', label: 'Otro', icon: <MessageSquare className="h-4 w-4" /> },
];

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
        <Typography variant="body" className="text-(--text-muted)">
          Contanos qué problema encontraste o qué te gustaría mejorar. Si podés, explica de la
          manera más detallada posible qué estabas haciendo y qué esperabas que pasara.
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Box className="flex overflow-hidden rounded-lg border border-(--border-soft)">
            {FEEDBACK_TYPES.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={clsx(
                  'flex flex-1 flex-col items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors md:flex-row md:gap-2',
                  index > 0 && 'border-l border-(--border-soft)',
                  type === option.value
                    ? 'bg-(--color-accent) text-white'
                    : 'bg-(--surface-muted) text-(--text-secondary) hover:bg-(--surface-highlight)'
                )}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
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
              icon={<Send className="h-4 w-4" />}
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
      icon={<MessageSquare className="h-4 w-4" />}
      type="accent"
      text="Feedback"
      tooltip="Enviar feedback"
      onClick={handleOpenFeedback}
      className="h-11 w-11 rounded-full shadow-lg md:w-auto"
    />
  );
}
