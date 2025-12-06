'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode
} from 'react';
import { useProfileQuery } from '@/features/user/queries';
import type { StoredProfile } from '@/lib/auth';

type ProfileContextValue = {
  isLoading: boolean;
  usingMockData: boolean;
  profile: StoredProfile | null;
  handleRefresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfilePage() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfilePage debe usarse dentro de ProfileProvider');
  }
  return context;
}

export default function ProfileProvider({ children }: { children: ReactNode }) {
  const profileQuery = useProfileQuery();
  const { refetch: refetchProfile } = profileQuery;
  const profile = profileQuery.data?.data ?? null;
  const isLoading = profileQuery.isLoading;
  const usingMockData = profileQuery.data?.isMock ?? false;

  const handleRefresh = useCallback(async () => {
    await refetchProfile();
  }, [refetchProfile]);

  const value: ProfileContextValue = useMemo(() => ({
    isLoading,
    usingMockData,
    profile,
    handleRefresh,
  }), [isLoading, usingMockData, profile, handleRefresh]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
