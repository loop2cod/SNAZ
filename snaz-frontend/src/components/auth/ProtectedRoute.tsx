"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: ('admin' | 'manager' | 'staff')[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (requiredRoles && user?.role && !requiredRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, loading, user, router, requiredRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requiredRoles && user?.role && !requiredRoles.includes(user.role)) {
    return null; // Will redirect to unauthorized
  }

  return <>{children}</>;
}