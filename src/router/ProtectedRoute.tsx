import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedEmail = user.email?.trim().toLowerCase() || '';
  const allowedAdmins = ['blu4ck@outlook.com'];

  if (adminOnly && !allowedAdmins.includes(normalizedEmail)) {
    return <Navigate to="/main" replace />;
  }

  return children;
}
