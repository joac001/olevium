'use client';

import { Container, Card, Box, Skeleton } from '@/components/shared/ui';

export default function DashboardSkeleton() {
  return (
    <Container className="py-8 space-y-8">
      <Box className="space-y-3">
        <Skeleton width="35%" height="32px" />
        <Skeleton width="60%" height="18px" />
      </Box>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={`sk-card-${idx}`} className="p-4">
            <Box className="space-y-3">
              <Skeleton width="60%" height="14px" />
              <Skeleton width="80%" height="14px" />
              <Skeleton width="50%" height="26px" />
            </Box>
          </Card>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-6 space-y-4">
          <Skeleton width="50%" height="20px" />
          <Skeleton width="40%" height="14px" />
          <Skeleton width="100%" height="200px" />
        </Card>
        <Card className="p-6 space-y-4">
          <Skeleton width="60%" height="20px" />
          <Skeleton width="50%" height="14px" />
          <Skeleton width="100%" height="180px" />
          <Box className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Box key={`sk-donut-${idx}`} className="flex items-center justify-between">
                <Skeleton width="40%" height="12px" />
                <Skeleton width="30%" height="12px" />
              </Box>
            ))}
          </Box>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-3">
          <Skeleton width="50%" height="18px" />
          <Skeleton width="40%" height="14px" />
          <Box className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Box key={`sk-bal-${idx}`} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <Skeleton width="40%" height="16px" />
                <Skeleton width="20%" height="14px" />
              </Box>
            ))}
          </Box>
        </Card>
        <Card className="p-6 space-y-3">
          <Skeleton width="50%" height="18px" />
          <Skeleton width="30%" height="14px" />
          <Box className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Box key={`sk-rec-${idx}`} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <Skeleton width="60%" height="14px" />
                <Skeleton width="25%" height="14px" />
              </Box>
            ))}
          </Box>
        </Card>
      </section>
    </Container>
  );
}
