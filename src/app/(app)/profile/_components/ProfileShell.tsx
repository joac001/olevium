'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import type { User } from '@/lib/api';

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
  const [user] = useState<User>(initialUser);

  const handleRefresh = useCallback(async () => {
    // In SSR mode, refresh would invalidate React Query cache or trigger a router refresh
    // For now, this is a placeholder
  }, []);

  const value: ProfileContextValue = useMemo(() => ({
    user,
    handleRefresh,
  }), [user, handleRefresh]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
