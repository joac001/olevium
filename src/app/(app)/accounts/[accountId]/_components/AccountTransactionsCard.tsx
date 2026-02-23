'use client';

import { Card } from '@/components/shared/ui';
import { useAccountDetail } from '../_context/AccountDetailContext';
import AccountTransactionsTable from '../../_components/AccountTransactionsTable';

export default function AccountTransactionsCard() {
  const { account, normalizedTransactions, loadingTransactions, handleOpenCreateTransaction } = useAccountDetail();

  const currencyLabel = account?.currency ?? 'Sin moneda';

  return (
    <Card
      tone="neutral"
      title="Transacciones"
      subtitle="Movimientos asociados a esta cuenta"
      actions={[
        {
          icon: 'fas fa-plus',
          tooltip: 'Agregar transacción',
          type: 'primary',
          onClick: handleOpenCreateTransaction,
        },
      ]}
    >
      <AccountTransactionsTable
        transactions={normalizedTransactions}
        loading={loadingTransactions}
        currency={currencyLabel}
      />
    </Card>
  );
}
