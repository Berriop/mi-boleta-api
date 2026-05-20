import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden: React.FC = () => {
  return (
    <div className="flex-center animate-fade-in" style={{ height: '100vh', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-app)', padding: '1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '6rem', color: 'var(--danger)', fontWeight: 800, lineHeight: 1 }}>403</h1>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Acceso Denegado</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        No tienes permisos suficientes para acceder a esta página. Esta sección es exclusiva para administradores.
      </p>
      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Volver al Dashboard
      </Link>
    </div>
  );
};

export default Forbidden;
