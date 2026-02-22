import { Container, Card, Box, Skeleton } from '@/components/shared/ui';

export default function ProfileSkeleton() {
  return (
    <Container className="max-w-2xl gap-6 py-10">
      {/* Profile header */}
      <Card className="p-6">
        <Box className="flex items-center gap-4">
          <Skeleton width="72px" height="72px" />
          <Box className="space-y-2">
            <Skeleton width="180px" height="20px" />
            <Skeleton width="240px" height="14px" />
          </Box>
        </Box>
      </Card>

      {/* Profile form */}
      <Card className="p-6">
        <Box className="space-y-4">
          <Skeleton width="40%" height="18px" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} className="space-y-1">
              <Skeleton width="25%" height="13px" />
              <Skeleton width="100%" height="40px" />
            </Box>
          ))}
          <Box className="flex justify-end pt-2">
            <Skeleton width="120px" height="36px" />
          </Box>
        </Box>
      </Card>

      {/* Change password form */}
      <Card className="p-6">
        <Box className="space-y-4">
          <Skeleton width="45%" height="18px" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Box key={i} className="space-y-1">
              <Skeleton width="30%" height="13px" />
              <Skeleton width="100%" height="40px" />
            </Box>
          ))}
          <Box className="flex justify-end pt-2">
            <Skeleton width="140px" height="36px" />
          </Box>
        </Box>
      </Card>
    </Container>
  );
}
