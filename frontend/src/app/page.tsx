'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.roles.includes('ADMIN')) router.push('/dashboard/admin');
        else if (user.roles.includes('MANAGER')) router.push('/dashboard/manager');
        else if (user.roles.includes('SELLER')) router.push('/dashboard/seller');
        else router.push('/dashboard/user');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
    </div>
  );
}
