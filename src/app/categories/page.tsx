import { Container } from '@/components/shared/ui';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import CategoriesShell from './_components/CategoriesShell';
import { getCategoriesPageData } from './_api';

export default async function CategoriesPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getCategoriesPageData());
  const data = handleProtectedResult(result);

  return (
    <Container className="py-10">
      <CategoriesShell
        initialCategories={data.categories}
        initialTransactionTypes={data.transactionTypes}
        initialUser={data.user}
      />
    </Container>
  );
}
