'use client';

import { useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';

import Box from '@/components/shared/ui/content/Box';
import Typography from '@/components/shared/ui/text/Typography';
import Button from '@/components/shared/ui/buttons/Button';
import { useNotification } from '@/context/NotificationContext';
import { postFeedback } from '@/lib/api';

type FeedbackType = 'bug' | 'feature' | 'other';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pathname = usePathname();
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    try {
      setIsSubmitting(true);
      const metadata =
        typeof window !== 'undefined'
          ? {
              userAgent: window.navigator.userAgent,
              language: window.navigator.language,
              platform: window.navigator.platform,
              viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
              },
              url: window.location.href,
              appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
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
      setMessage('');
      setType('bug');
      setIsOpen(false);
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
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[1100] flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:scale-105 transition-transform"
        aria-label="Enviar feedback"
      >
        <i className="fas fa-message" aria-hidden />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 px-4">
          <Box className="w-full max-w-md rounded-2xl bg-[var(--surface-elevated)] p-5 shadow-2xl">
            <Typography variant="h2" className="mb-2">
              Enviar feedback
            </Typography>
            <Typography variant="caption" className="mb-4 text-[color:var(--text-muted)]">
              Contanos qué problema encontraste o qué te gustaría mejorar.
            </Typography>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                {[
                  { value: 'bug', label: 'Tengo un problema' },
                  { value: 'feature', label: 'Quiero proponer una mejora' },
                  { value: 'other', label: 'Otro comentario' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value as FeedbackType)}
                    className={[
                      'flex-1 rounded-full border px-3 py-1 text-sm transition-colors',
                      type === option.value
                        ? 'bg-[var(--color-primary)] text-white border-transparent'
                        : 'bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] border-[color:var(--border-subtle)]',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full min-h-[120px] resize-y rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-muted)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Ej: Encontré un error al crear una cuenta..."
                />
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  Se enviará también la pantalla actual para ayudarnos a reproducir el problema.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  text="Cancelar"
                  onClick={() => setIsOpen(false)}
                  type="neutral"
                  htmlType="button"
                />
                <Button
                  text={isSubmitting ? 'Enviando...' : 'Enviar'}
                  disabled={isSubmitting || !message.trim()}
                  htmlType="submit"
                  icon="fas fa-paper-plane"
                  iconPosition="end"
                />
              </div>
            </form>
          </Box>
        </div>
      )}
    </>
  );
}
