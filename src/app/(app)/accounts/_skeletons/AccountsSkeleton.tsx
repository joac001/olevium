import { Container, Card, Box, Skeleton } from '@/components/shared/ui';

export default function AccountsSkeleton() {
  return (
    <Container className="py-10">
      <Box className="flex w-full max-w-6xl flex-col gap-6">
        <Card tone="neutral">
          <Box className="space-y-4">
            {/* Balances section */}
            <Box className="space-y-3 rounded-2xl p-4">
              <Skeleton width="25%" height="16px" />
              {Array.from({ length: 2 }).map((_, i) => (
                <Box key={i} className="flex items-center justify-between py-2">
                  <Skeleton width="35%" height="14px" />
                  <Skeleton width="20%" height="18px" />
                </Box>
              ))}
            </Box>

            {/* Table header */}
            <Box className="flex items-center justify-between px-1">
              <Skeleton width="30%" height="14px" />
              <Skeleton width="10%" height="32px" />
            </Box>

            {/* Table rows */}
            <Box className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Box
                  key={i}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                >
                  <Box className="flex items-center gap-3">
                    <Skeleton width="36px" height="36px" />
                    <Box className="space-y-1">
                      <Skeleton width="140px" height="14px" />
                      <Skeleton width="80px" height="12px" />
                    </Box>
                  </Box>
                  <Skeleton width="80px" height="16px" />
                </Box>
              ))}
            </Box>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}
