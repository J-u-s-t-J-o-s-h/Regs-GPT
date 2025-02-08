import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ComponentType } from 'react';

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      router.replace('/');
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 