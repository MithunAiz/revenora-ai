import { PropsWithChildren } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';

interface RequireAuthProps {
  allowedRoles: Role[];
}

export function RequireAuth({ allowedRoles, children }: PropsWithChildren<RequireAuthProps>) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children ?? <Outlet />;
}