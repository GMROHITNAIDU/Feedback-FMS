import { type ReactNode, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquareText } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 animate-pulse">
          <MessageSquareText className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm text-neutral-500">{message}</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin, fetchProfileWithRetry } = useAuth();
  const location = useLocation();
  const retryStarted = useRef(false);

  // If the user is authenticated but the profile hasn't loaded yet (e.g. trigger delay
  // on first signup), retry fetching it. This prevents a false redirect.
  useEffect(() => {
    if (!profile && user && !retryStarted.current) {
      retryStarted.current = true;
      fetchProfileWithRetry(user.id, 3);
    }
  }, [profile, user, fetchProfileWithRetry]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && profile && !isAdmin) {
    return <Navigate to="/my-feedback" replace />;
  }

  if (!profile && user) {
    return <LoadingScreen message="Setting up your account..." />;
  }

  return <>{children}</>;
}
