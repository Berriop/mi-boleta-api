import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex-center animate-fade-in" style={{ height: '100vh', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-app)', padding: '1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '6rem', color: 'var(--primary)', fontWeight: 800, lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Página no encontrada</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        Lo sentimos, la página que estás buscando no existe o ha sido movida a otra ubicación.
      </p>
      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Volver al Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
