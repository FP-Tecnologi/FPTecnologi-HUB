'use client';
/*
 * Vireo Next.js — RequireAuth guard.
 *
 * Wraps the (shell) route group: redirects to the sign-in screen when there is
 * no authenticated user once the AuthContext has finished its bootstrap check
 * (avoids a flash-redirect while tokens are still being read from storage).
 */
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../shell/Loader';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/sign-in-basic');
  }, [loading, user, router]);

  if (loading || !user) return <Loader />;
  return <>{children}</>;
}

export default RequireAuth;
