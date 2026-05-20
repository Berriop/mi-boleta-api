import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/store/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-center animate-fade-in" style={{ height: '100vh', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-app)' }}>
        <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '50%' }}></div>
        <div className="skeleton" style={{ width: '120px', height: '16px' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Cargando sesión segura...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir a login y recordar la ruta que intentó visitar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Redirigir a 403 o al dashboard principal si no es admin
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
