'use client';

import { Box, Card } from "@/components/shared/ui";

const SkeletonLine = ({ className = "" }: { className?: string }) => (
  <Box aria-hidden className={`h-4 w-full animate-pulse rounded-full bg-[color:var(--surface-muted)] ${className}`} />
);

const SkeletonBadge = () => (
  <Box aria-hidden className="h-8 w-20 animate-pulse rounded-full bg-[color:var(--surface-muted)]" />
);

const SkeletonCard = () => (
  <Card tone="neutral">
    <Box className="flex flex-col gap-5">
      <SkeletonLine className="h-6 w-48" />
      <Box className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBadge key={index} />
        ))}
      </Box>
    </Box>
  </Card>
);

export default function CategoriesListSkeleton() {
  return (
    <Box className="flex flex-col gap-6">
      <SkeletonCard />
      <SkeletonCard />
    </Box>
  );
}
