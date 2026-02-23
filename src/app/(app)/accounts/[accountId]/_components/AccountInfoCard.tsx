'use client';

import { Card, Box, Typography } from '@/components/shared/ui';
import { formatAmount, formatDate } from '@/lib/utils/parser';
import { useAccountDetail } from '../_context/AccountDetailContext';

export default function AccountInfoCard() {
  const { account, typeLabel, handleOpenEdit, handleOpenDelete } = useAccountDetail();

  if (!account) {
    return (
      <Card tone="neutral" title="Cuenta no disponible">
        <Typography variant="body">No pudimos encontrar los datos de esta cuenta.</Typography>
      </Card>
    );
  }

  const currencyLabel = account.currency ?? 'Sin moneda';

  return (
    <Card
      tone="neutral"
      title={account.name}
      subtitle={`Saldo actual: ${formatAmount(account.balance, currencyLabel)}`}
      actions={[
        {
          icon: 'fas fa-pen',
          text: 'Editar',
          type: 'primary',
          onClick: handleOpenEdit,
        },
        {
          icon: 'fas fa-trash',
          text: 'Eliminar',
          type: 'danger',
          onClick: handleOpenDelete,
        },
      ]}
    >
      <Box className="space-y-3">
        <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
          Tipo de cuenta:{' '}
          <Box as="span" className="font-semibold text-[color:var(--text-primary)]">
            {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
          </Box>
        </Typography>
        <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
          Moneda:{' '}
          <Box as="span" className="font-semibold text-[color:var(--text-primary)]">
            {currencyLabel}
          </Box>
        </Typography>
        <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
          Creada el {formatDate(account.createdAt, 'dd/mm/aaaa')}
        </Typography>
      </Box>
    </Card>
  );
}
