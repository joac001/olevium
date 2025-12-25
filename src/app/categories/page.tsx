import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Container } from '@/components/shared/ui';
import CategoriesShell from './_components/CategoriesShell';
import { getCategoriesPageData } from './_api';

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('olevium_access_token');
  const refreshToken = cookieStore.get('olevium_refresh_token');

  if (!accessToken?.value && !refreshToken?.value) {
    redirect('/auth');
  }

  const data = await getCategoriesPageData();

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
