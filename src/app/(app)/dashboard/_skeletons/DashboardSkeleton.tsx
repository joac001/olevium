'use client';

import { Container, Card, Box, Skeleton } from '@/components/shared/ui';

export default function DashboardSkeleton() {
  return (
    <Container className="py-8 space-y-8">
      <Box className="space-y-3">
        <Skeleton width="35%" height="32px" />
        <Skeleton width="60%" height="18px" />
      </Box>

      {/* KPI cards — 5 columns on xl */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={`sk-card-${idx}`} className="p-4">
            <Box className="space-y-3">
              <Skeleton width="60%" height="14px" />
              <Skeleton width="50%" height="26px" />
              <Skeleton width="40%" height="12px" />
            </Box>
          </Card>
        ))}
      </section>

      {/* Charts */}
      <section className="space-y-6">
        <Card className="p-6 space-y-4">
          <Skeleton width="50%" height="20px" />
          <Skeleton width="100%" height="200px" />
        </Card>
        <Box className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Card key={`sk-donut-${idx}`} className="p-6 space-y-4">
              <Skeleton width="60%" height="20px" />
              <Skeleton width="100%" height="180px" />
              <Box className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i} className="flex items-center justify-between">
                    <Skeleton width="40%" height="12px" />
                    <Skeleton width="25%" height="12px" />
                  </Box>
                ))}
              </Box>
            </Card>
          ))}
        </Box>
      </section>

      {/* Accounts / Top categories / Configurable categories */}
      <section className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={`sk-mid-${idx}`} className="p-6 space-y-3">
            <Skeleton width="55%" height="18px" />
            <Box className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <Skeleton width="45%" height="14px" />
                  <Skeleton width="25%" height="14px" />
                </Box>
              ))}
            </Box>
          </Card>
        ))}
      </section>

      {/* Recent transactions / Upcoming recurrences */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="p-6 space-y-3">
          <Skeleton width="50%" height="18px" />
          <Box className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Box key={idx} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <Box className="space-y-1.5">
                  <Skeleton width="120px" height="14px" />
                  <Skeleton width="80px" height="12px" />
                </Box>
                <Skeleton width="60px" height="14px" />
              </Box>
            ))}
          </Box>
        </Card>
        <Card className="p-6 space-y-3">
          <Skeleton width="55%" height="18px" />
          <Box className="space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Box key={idx} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <Box className="space-y-1.5">
                  <Skeleton width="100px" height="14px" />
                  <Skeleton width="70px" height="12px" />
                </Box>
                <Skeleton width="55px" height="14px" />
              </Box>
            ))}
          </Box>
        </Card>
      </section>
    </Container>
  );
}
