import { Container } from '@/components/shared/ui';
import ProfileProvider from './_components/ProfileProvider';
import ProfileHeader from './_components/ProfileHeader';
import ProfileForm from './_components/ProfileForm';
import ChangePasswordForm from './_components/ChangePasswordForm';

export default function ProfilePage() {
  return (
    <ProfileProvider>
      <Container className="gap-6">
        <ProfileHeader />
        <ProfileForm />
        <ChangePasswordForm />
      </Container>
    </ProfileProvider>
  );
}
