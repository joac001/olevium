'use client';

import { Box } from '@/components/shared/ui';
import AccountDetailCardSkeleton from './AccountDetailCardSkeleton';
import AccountTransactionsTableSkeleton from './AccountTransactionsTableSkeleton';

export default function AccountDetailSkeleton() {
  return (
    <Box className="flex w-full max-w-6xl flex-col gap-6">
      <AccountDetailCardSkeleton />
      <AccountTransactionsTableSkeleton />
    </Box>
  );
}
