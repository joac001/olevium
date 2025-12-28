'use client';

import { ActionButton, Box, Typography } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import WhatsAppTokenModal from './WhatsAppTokenModal';

export default function ProfileHeader() {
  const { showModal } = useModal();

  const handleOpenWhatsApp = () => {
    showModal(<WhatsAppTokenModal />);
  };

  return (
    <Box className="flex flex-col gap-3">
      <Box className="flex flex-col gap-2">
        <Typography variant="h1">Perfil de Usuario</Typography>
        <Typography variant="body">
          Gestioná tu información personal y la configuración de tu cuenta.
        </Typography>
      </Box>
      <ActionButton
        icon="fab fa-whatsapp"
        type="success"
        text="WhatsApp"
        onClick={handleOpenWhatsApp}
      />
    </Box>
  );
}
