import { Container, Card, Box, Skeleton } from '@/components/shared/ui';

export default function RecurringTransactionsSkeleton() {
  return (
    <Container className="gap-6">
      {/* Header */}
      <Box className="flex items-center justify-between">
        <Skeleton width="45%" height="28px" />
        <Skeleton width="130px" height="36px" />
      </Box>

      {/* Table */}
      <Card>
        {/* Table header */}
        <Box className="flex items-center gap-4 px-4 py-3">
          <Skeleton width="25%" height="13px" />
          <Skeleton width="20%" height="13px" />
          <Skeleton width="20%" height="13px" />
          <Skeleton width="15%" height="13px" />
        </Box>
        {/* Table rows */}
        <Box className="divide-y divide-(--border-soft)">
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} className="flex items-center gap-4 px-4 py-3">
              <Box className="flex w-[25%] items-center gap-2">
                <Skeleton width="28px" height="28px" />
                <Skeleton width="75%" height="14px" />
              </Box>
              <Skeleton width="20%" height="13px" />
              <Skeleton width="20%" height="13px" />
              <Skeleton width="15%" height="16px" />
            </Box>
          ))}
        </Box>
      </Card>
    </Container>
  );
}
