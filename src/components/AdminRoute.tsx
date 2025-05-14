import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Shield } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';

  // Show loading state if auth is still being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to dashboard if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          Only administrators can access this page
        </p>
      </div>
    );
  }

  // Render children if authenticated and admin
  return <>{children}</>;
};