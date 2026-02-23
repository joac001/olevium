'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Box, FormWrapper, Input } from '@/components/shared/ui';
import type { ButtonProps } from '@/components/shared/ui/buttons';
import { useUpdateProfileMutation } from '@/features/user/mutations';
import { useProfileQuery } from '@/features/user/queries';
import { useNotification } from '@/context/NotificationContext';
import type { User } from '@/types';

interface ProfileFormProps {
  initialUser: User;
}

export default function ProfileForm({ initialUser }: ProfileFormProps) {
  const { data: user = initialUser } = useProfileQuery({ initialData: initialUser });
  const { showNotification } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const updateProfileMutation = useUpdateProfileMutation();

  useEffect(() => {
    if (user) {
      setName(user.username ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      await updateProfileMutation.mutateAsync({ name, email });
      showNotification(<CheckCircle className="h-5 w-5" />, 'success', 'Perfil actualizado', 'Tu información se guardó correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el perfil';
      showNotification(<AlertTriangle className="h-5 w-5" />, 'danger', 'Error', message);
    }
  };

  const buttons: ButtonProps[] = [
    {
      type: 'primary',
      text: 'Guardar cambios',
      htmlType: 'submit',
      disabled: updateProfileMutation.isPending,
    },
  ];

  return (
    <Box className="w-full max-w-lg">
      <FormWrapper
        onSubmit={handleSubmit}
        buttons={buttons}
        className="space-y-4"
      >
        <Input
          label="Nombre"
          value={name}
          onValueChange={(value) => setName(String(value ?? ''))}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          disabled
        />
      </FormWrapper>
    </Box>
  );
}
