'use client';

import { Box, Card } from '@/components/shared/ui';

interface SkeletonProps {
  className?: string;
}

const SkeletonLine = ({ className }: SkeletonProps) => (
  <Box
    aria-hidden
    className={`h-4 w-full animate-pulse rounded-full bg-[color:var(--surface-muted)] ${className ?? ''}`}
  />
);

const SkeletonPill = ({ className }: SkeletonProps) => (
  <Box
    aria-hidden
    className={`h-10 w-28 animate-pulse rounded-full bg-[color:var(--surface-muted)] ${className ?? ''}`}
  />
);

export default function AccountDetailCardSkeleton() {
  return (
    <Card tone="neutral">
      <Box className="flex flex-col gap-6">
        <Box className="flex flex-wrap items-start justify-between gap-4">
          <Box className="flex min-w-0 flex-col gap-3">
            <SkeletonLine className="h-7 w-56" />
            <SkeletonLine className="h-5 w-48" />
          </Box>

          <Box className="flex items-center gap-3">
            <SkeletonPill />
            <SkeletonPill />
          </Box>
        </Box>

        <Box className="grid gap-4 md:grid-cols-3">
          <SkeletonLine className="h-5 w-full" />
          <SkeletonLine className="h-5 w-full" />
          <SkeletonLine className="h-5 w-full" />
        </Box>
      </Box>
    </Card>
  );
}
