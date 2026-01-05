import { redirectIfAuthenticated } from '@/lib/server-auth';
import LandingPage from './landing/page';

export default async function RootPage() {
  await redirectIfAuthenticated();
  return <LandingPage />;
}
