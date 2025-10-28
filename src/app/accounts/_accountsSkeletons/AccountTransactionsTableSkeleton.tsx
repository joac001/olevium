'use client';

import { Box, Card } from "@/components/shared/ui";

interface SkeletonProps {
  className?: string;
}

const SkeletonLine = ({ className }: SkeletonProps) => (
  <Box
    aria-hidden
    className={`h-4 w-full animate-pulse rounded-full bg-[color:var(--surface-muted)] ${className ?? ""}`}
  />
);

const SkeletonRow = () => (
  <Box className="rounded-2xl bg-[color:var(--surface-glass)] p-4">
    <Box className="hidden gap-4 md:grid md:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
      <SkeletonLine className="h-5" />
      <SkeletonLine className="h-5" />
      <SkeletonLine className="h-5" />
      <SkeletonLine className="h-5" />
      <Box className="flex justify-end gap-2">
        <SkeletonLine className="h-10 w-10 rounded-full" />
        <SkeletonLine className="h-10 w-10 rounded-full" />
      </Box>
    </Box>

    <Box className="flex flex-col gap-4 md:hidden">
      <SkeletonLine className="h-5" />
      <SkeletonLine className="h-5 w-32" />
      <SkeletonLine className="h-5 w-24" />
      <Box className="flex gap-2">
        <SkeletonLine className="h-10 w-10 rounded-full" />
        <SkeletonLine className="h-10 w-10 rounded-full" />
      </Box>
    </Box>
  </Box>
);

export default function AccountTransactionsTableSkeleton() {
  return (
    <Card tone="neutral">
      <Box className="flex flex-col gap-5">
        <Box className="flex flex-wrap items-start justify-between gap-4">
          <Box className="flex min-w-0 flex-col gap-2">
            <SkeletonLine className="h-6 w-48" />
            <SkeletonLine className="h-4 w-64" />
          </Box>
          <SkeletonLine className="h-10 w-32 rounded-full" />
        </Box>

        <Box className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </Box>
      </Box>
    </Card>
  );
}
