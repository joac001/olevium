'use client';

import { Container, Card, Box, Skeleton } from '@/components/shared/ui';

export default function TransactionsSkeleton() {
  return (
    <Container className="gap-6">
      {/* Header */}
      <Box className="flex items-center justify-between">
        <Skeleton width="40%" height="28px" />
        <Box className="flex gap-2">
          <Skeleton width="100px" height="36px" />
          <Skeleton width="120px" height="36px" />
        </Box>
      </Box>

      {/* Summary cards */}
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Box className="space-y-2">
              <Skeleton width="55%" height="13px" />
              <Skeleton width="70%" height="24px" />
            </Box>
          </Card>
        ))}
      </Box>

      {/* Filters */}
      <Box className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width="100px" height="34px" />
        ))}
      </Box>

      {/* Table */}
      <Card>
        {/* Table header */}
        <Box className="flex items-center gap-4 px-4 py-3">
          <Skeleton width="15%" height="13px" />
          <Skeleton width="30%" height="13px" />
          <Skeleton width="20%" height="13px" />
          <Skeleton width="15%" height="13px" />
        </Box>
        {/* Table rows */}
        <Box className="divide-y divide-[var(--border-soft)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton width="15%" height="13px" />
              <Skeleton width="30%" height="13px" />
              <Box className="flex w-[20%] items-center gap-2">
                <Skeleton width="20px" height="20px" />
                <Skeleton width="80%" height="13px" />
              </Box>
              <Skeleton width="15%" height="16px" />
            </Box>
          ))}
        </Box>
      </Card>
    </Container>
  );
}
