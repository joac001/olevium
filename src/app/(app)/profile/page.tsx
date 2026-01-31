import { Container } from '@/components/shared/ui';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import ProfileShell from './_components/ProfileShell';
import ProfileHeader from './_components/ProfileHeader';
import ProfileForm from './_components/ProfileForm';
import ChangePasswordForm from './_components/ChangePasswordForm';
import { getProfilePageData } from './_api';

export default async function ProfilePage() {
  await requireAuth();

  const result = await withAuthProtection(() => getProfilePageData());
  const data = await handleProtectedResult(result);

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
