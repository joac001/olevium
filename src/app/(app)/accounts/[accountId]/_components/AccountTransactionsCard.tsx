'use client';

import { Plus } from 'lucide-react';
import { Card } from '@/components/shared/ui';
import { useAccountDetail } from '../_context/AccountDetailContext';
import AccountTransactionsTable from '../../_components/AccountTransactionsTable';

export default function AccountTransactionsCard() {
  const { account, normalizedTransactions, loadingTransactions, page, totalPages, setPage, handleOpenCreateTransaction } = useAccountDetail();

  const currencyLabel = account?.currency ?? 'Sin moneda';

  return (
    <Card
      tone="neutral"
      title="Transacciones"
      subtitle="Movimientos asociados a esta cuenta"
      actions={[
        {
          icon: <Plus className="h-4 w-4" />,
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
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </Card>
  );
}
