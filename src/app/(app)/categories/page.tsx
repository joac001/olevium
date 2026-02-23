import { Suspense } from 'react';
import { Container, Box } from '@/components/shared/ui';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import UserCategoriesCard from './_components/UserCategoriesCard';
import DefaultCategoriesSection from './_components/DefaultCategoriesSection';
import CategoriesListSkeleton from './_skeletons/CategoriesListSkeleton';
import { getCategoriesPageData } from './_api';

export default async function CategoriesPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getCategoriesPageData());
  const data = await handleProtectedResult(result);

  const userId = String(data.user.user_id);
  const defaultCategories = data.categories.filter(c => !c.user_id);

  return (
    <Container className="py-10">
      <Box className="flex flex-col gap-6">
        <Suspense fallback={<CategoriesListSkeleton />}>
          <UserCategoriesCard
            initialCategories={data.categories}
            initialTransactionTypes={data.transactionTypes}
            userId={userId}
          />
        </Suspense>
        {/* Server Component — zero JS al cliente para esta sección */}
        <DefaultCategoriesSection
          categories={defaultCategories}
          transactionTypes={data.transactionTypes}
        />
      </Box>
    </Container>
  );
}
