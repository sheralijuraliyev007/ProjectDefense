import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authApi from '../../api/authApi';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isCurrentlyAllowed, setIsCurrentlyAllowed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsChecking(false);
      return;
    }

    let cancelled = false;
    authApi.getCurrentUser()
      .then((res) => {
        if (cancelled) return;
        const liveRoles = res.data.data.roles ?? [];
        const allowed = liveRoles.includes('Administrator') || allowedRoles.some((r) => liveRoles.includes(r));
        setIsCurrentlyAllowed(allowed);
      })
      .catch(() => {
        if (!cancelled) setIsCurrentlyAllowed(false);
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, allowedRoles]);

  if (isLoading || isChecking) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isCurrentlyAllowed) return <Navigate to="/" replace />;

  return <Outlet />;
}