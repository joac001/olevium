import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Container } from '@/components/shared/ui';
import ProfileShell from './_components/ProfileShell';
import ProfileHeader from './_components/ProfileHeader';
import ProfileForm from './_components/ProfileForm';
import ChangePasswordForm from './_components/ChangePasswordForm';
import { getProfilePageData } from './_api';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('olevium_access_token');
  const refreshToken = cookieStore.get('olevium_refresh_token');

  if (!accessToken?.value && !refreshToken?.value) {
    redirect('/auth');
  }

  const data = await getProfilePageData();

  return (
    <ProfileShell initialUser={data.user}>
      <Container className="gap-6 items-center py-10">
        <ProfileHeader />
        <ProfileForm />
        <ChangePasswordForm />
      </Container>
    </ProfileShell>
  );
}
