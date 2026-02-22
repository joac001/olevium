'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode
} from 'react';
import type { User } from '@/lib/api';
import { useProfileQuery } from '@/features/user/queries';

type ProfileContextValue = {
  user: User;
  handleRefresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfilePage() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfilePage debe usarse dentro de ProfileShell');
  }
  return context;
}

interface ProfileShellProps {
  initialUser: User;
  children: ReactNode;
}

export default function ProfileShell({ initialUser, children }: ProfileShellProps) {
  const { data: user = initialUser } = useProfileQuery({ initialData: initialUser });

  // handleRefresh is kept for API compatibility — mutations auto-invalidate userKeys.me
  const handleRefresh = async () => {};

  const value: ProfileContextValue = useMemo(() => ({
    user,
    handleRefresh,
  }), [user]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
