'use client';

import { useState, useEffect } from 'react';
import { Box, Card, Typography, Input } from '@/components/shared/ui';
import { ActionButton } from '@/components/shared/ui';
import { useCreateChatTokenMutation, useRegenerateChatTokenMutation } from '@/features/user/mutations';
import { useNotification } from '@/context/NotificationContext';
import { useModal } from '@/context/ModalContext';

const CHAT_TOKEN_STORAGE_KEY = 'olevium_chat_token';

export default function WhatsAppTokenModal() {
  const [chatToken, setChatToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const { showNotification } = useNotification();
  const { hideModal } = useModal();

  const createTokenMutation = useCreateChatTokenMutation();
  const regenerateTokenMutation = useRegenerateChatTokenMutation();

  // Cargar token desde localStorage al montar
  useEffect(() => {
    const storedToken = localStorage.getItem(CHAT_TOKEN_STORAGE_KEY);
    if (storedToken) {
      setChatToken(storedToken);
      setHasToken(true);
    }
  }, []);

  const saveToken = (token: string) => {
    localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, token);
    setChatToken(token);
    setHasToken(true);
  };

  const formattedToken = chatToken ? `ct-${chatToken}` : '';

  const handleCreateToken = async () => {
    try {
      const result = await createTokenMutation.mutateAsync();
      saveToken(result.chat_token);
      showNotification('fas fa-circle-check', 'success', 'Token creado', 'Tu token de WhatsApp fue creado exitosamente.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      // Si el token ya existe (409 o mensaje específico), regenerarlo automáticamente
      const isConflictError = errorMessage.includes('409') || errorMessage.toLowerCase().includes('ya existe');
      
      if (isConflictError) {
        try {
          const result = await regenerateTokenMutation.mutateAsync();
          saveToken(result.chat_token);
          showNotification('fas fa-circle-check', 'success', 'Token regenerado', 'Ya tenías un token activo. Se generó uno nuevo.');
          return;
        } catch (regenError) {
          const message = regenError instanceof Error ? regenError.message : 'No se pudo regenerar el token';
          showNotification('fas fa-triangle-exclamation', 'danger', 'Error', message);
          return;
        }
      }
      const message = errorMessage || 'No se pudo crear el token';
      showNotification('fas fa-triangle-exclamation', 'danger', 'Error', message);
    }
  };

  const handleRegenerateToken = async () => {
    try {
      const result = await regenerateTokenMutation.mutateAsync();
      saveToken(result.chat_token);
      showNotification('fas fa-circle-check', 'success', 'Token regenerado', 'Tu token de WhatsApp fue regenerado. El anterior ya no funcionará.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo regenerar el token';
      showNotification('fas fa-triangle-exclamation', 'danger', 'Error', message);
    }
  };

  const handleCopyToken = () => {
    if (formattedToken) {
      navigator.clipboard.writeText(formattedToken);
      showNotification('fas fa-copy', 'success', 'Copiado', 'Token copiado al portapapeles.');
    }
  };

  const isLoading = createTokenMutation.isPending || regenerateTokenMutation.isPending;

  return (
    <Card tone="success" title="Integración WhatsApp">
      <Box className="flex flex-col gap-4">
        {/* Sección de instrucciones */}
        <Box className="flex flex-col gap-2">
          <Typography variant="h2">Instrucciones</Typography>
          <Box className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
            <Typography variant="body" className="text-neutral-600 dark:text-neutral-400">
              <strong>1.</strong> Generá tu token usando el botón de abajo.<br />
              <strong>2.</strong> Copiá el token y envialo por WhatsApp al <strong>+54 9 11 1234 5678</strong>.<br />
              <strong>3.</strong> ¡Listo! Ya podés gestionar tus finanzas desde WhatsApp.
            </Typography>
          </Box>
        </Box>

        {/* Sección del token */}
        <Box className="flex flex-col gap-2">
          <Typography variant="h2">Tu Chat Token</Typography>
          {hasToken && formattedToken ? (
            <Box className="flex items-center gap-2">
              <Input
                value={formattedToken}
                disabled
              />
              <ActionButton
                icon="fas fa-copy"
                type="accent"
                tooltip="Copiar token"
                onClick={handleCopyToken}
              />
            </Box>
          ) : (
            <Box className="rounded-lg border border-dashed border-neutral-300 p-4 text-center dark:border-neutral-600">
              <Typography variant="body" className="text-neutral-500">
                No tenés un token activo. Creá uno para comenzar.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Botones de acción */}
        <Box className="flex flex-wrap items-center gap-2 pt-2">
          {!hasToken ? (
            <ActionButton
              icon="fas fa-plus"
              type="success"
              text="Crear Token"
              onClick={handleCreateToken}
              disabled={isLoading}
            />
          ) : (
            <ActionButton
              icon="fas fa-arrows-rotate"
              type="warning"
              text="Regenerar Token"
              onClick={handleRegenerateToken}
              disabled={isLoading}
            />
          )}
        </Box>
      </Box>
    </Card>
  );
}
