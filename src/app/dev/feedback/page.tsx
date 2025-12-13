'use client';

import { useEffect, useState } from 'react';

import { Container } from '@/components/shared/ui';
import Box from '@/components/shared/ui/content/Box';
import Typography from '@/components/shared/ui/text/Typography';
import Skeleton from '@/components/shared/ui/feedback/Skeleton';
import Button from '@/components/shared/ui/buttons/Button';
import { useNotification } from '@/context/NotificationContext';
import { getFeedback, postFeedback } from '@/lib/api';
import type { FeedbackItem, FeedbackPayload } from '@/lib/types';

type FilterType = FeedbackItem['type'] | 'all';
type FilterStatus = FeedbackItem['status'] | 'all';

export default function DevFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('new');

  const { showError } = useNotification();

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const { data } = await getFeedback({
        type: typeFilter === 'all' ? undefined : typeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 100,
      });
      setItems(data);
    } catch (error) {
      showError(error, {
        operation: 'fetch',
        resource: 'feedback',
        userFriendlyOperation: 'feedback',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  return (
    <Container className="gap-6">
      <Box className="flex flex-col gap-2">
        <Typography variant="h2">Feedback de usuarios</Typography>
        <Typography variant="caption" className="text-[color:var(--text-muted)] max-w-2xl">
          Vista interna para el equipo. Acá ves los reportes de problemas, propuestas de mejora y
          otros comentarios que llegan desde el prototipo.
        </Typography>
      </Box>

      <Box className="flex flex-wrap items-center gap-3 justify-between">
        <Box className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todos los tipos' },
            { value: 'bug', label: 'Tengo un problema' },
            { value: 'feature', label: 'Mejoras' },
            { value: 'other', label: 'Otros' },
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTypeFilter(option.value as FilterType)}
              className={[
                'rounded-full border px-3 py-1 text-xs md:text-sm transition-colors',
                typeFilter === option.value
                  ? 'bg-[var(--color-primary)] text-white border-transparent'
                  : 'bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] border-[color:var(--border-subtle)]',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </Box>

        <Box className="flex flex-wrap gap-2 items-center">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as FilterStatus)}
            className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs md:text-sm text-[color:var(--text-primary)]"
          >
            <option value="new">Nuevos</option>
            <option value="triaged">Triaged</option>
            <option value="in_github">Con issue</option>
            <option value="resolved">Resueltos</option>
            <option value="all">Todos los estados</option>
          </select>
          <Button
            text="Actualizar"
            icon="fas fa-rotate"
            iconPosition="end"
            onClick={() => void loadFeedback()}
          />
        </Box>
      </Box>

      <Box className="flex flex-col gap-3">
        {loading && (
          <>
            <Skeleton height="3.5rem" />
            <Skeleton height="3.5rem" />
            <Skeleton height="3.5rem" />
          </>
        )}

        {!loading && items.length === 0 && (
          <Typography variant="caption" className="text-[color:var(--text-muted)]">
            No hay feedback para los filtros seleccionados.
          </Typography>
        )}

        {!loading &&
          items.map(item => (
            <Box
              key={item.feedback_id}
              className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-muted)] p-4 flex flex-col gap-2"
            >
              <Box className="flex flex-wrap items-center justify-between gap-2">
                <Box className="flex items-center gap-2">
                  <span
                    className={[
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      item.type === 'bug'
                        ? 'bg-red-500/10 text-red-300'
                        : item.type === 'feature'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : 'bg-slate-500/10 text-slate-200',
                    ].join(' ')}
                  >
                    {item.type === 'bug'
                      ? 'Tengo un problema'
                      : item.type === 'feature'
                        ? 'Propuesta de mejora'
                        : 'Otro comentario'}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-[color:var(--text-muted)]">
                    {item.status}
                  </span>
                </Box>
                <Typography variant="caption" className="text-[color:var(--text-muted)] text-xs">
                  {new Date(item.created_at).toLocaleString('es-AR')}
                </Typography>
              </Box>

                <Typography variant="body">{item.message}</Typography>

              <Box className="flex flex-col gap-1 text-[10px] text-[color:var(--text-muted)]">
                {item.page_path && <span>Pantalla: {item.page_path}</span>}
                {item.metadata?.url && <span>URL: {String(item.metadata.url)}</span>}
                {item.metadata?.language && <span>Idioma: {String(item.metadata.language)}</span>}
                {item.metadata?.platform && <span>Plataforma: {String(item.metadata.platform)}</span>}
                {item.metadata?.viewport && (
                  <span>
                    Viewport: {String((item.metadata.viewport as any).width)} x{' '}
                    {String((item.metadata.viewport as any).height)}
                  </span>
                )}
                {item.metadata?.userAgent && (
                  <span className="truncate">User agent: {String(item.metadata.userAgent)}</span>
                )}
              </Box>

              <Box className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wide text-[color:var(--text-muted)] mr-2">
                  Gestionar estado:
                </span>
                <Button
                  text="Marcar triage"
                  type="secondary"
                  className="!px-3 !py-1 !text-xs"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')}/feedback/${item.feedback_id}`,
                        {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ status: 'triaged' }),
                          credentials: 'include',
                        }
                      );
                      if (!res.ok) {
                        throw new Error(`No se pudo actualizar (status ${res.status})`);
                      }
                      await loadFeedback();
                    } catch (error) {
                      showError(error, {
                        operation: 'update',
                        resource: 'feedback',
                        userFriendlyOperation: 'feedback',
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
                <Button
                  text="Marcar resuelto"
                  type="success"
                  className="!px-3 !py-1 !text-xs"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')}/feedback/${item.feedback_id}`,
                        {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ status: 'resolved' }),
                          credentials: 'include',
                        }
                      );
                      if (!res.ok) {
                        throw new Error(`No se pudo actualizar (status ${res.status})`);
                      }
                      await loadFeedback();
                    } catch (error) {
                      showError(error, {
                        operation: 'update',
                        resource: 'feedback',
                        userFriendlyOperation: 'feedback',
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </Box>
            </Box>
          ))}
      </Box>
    </Container>
  );
}
