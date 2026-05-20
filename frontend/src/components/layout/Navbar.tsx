import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/store/authContext';
import { 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  ShieldAlert, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estado del tema
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('mi_boleta_theme') as 'light' | 'dark') || 'dark';
  });

  // Estado del menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Alternar tema Claro / Oscuro
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('mi_boleta_theme', nextTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'var(--transition)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4.5rem'
      }}>
        {/* Logo / Nombre de la App */}
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          color: 'var(--text-primary)',
          fontSize: '1.25rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          textDecoration: 'none'
        }}>
          <div className="flex-center" style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}>
            <Sparkles size={18} />
          </div>
          <span style={{ 
            background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ¿Y si sí me lo gané?
          </span>
        </Link>

        {/* Menú Desktop */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '1.5rem',
        }} className="desktop-menu-container">
          {/* Navegación */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Link 
              to="/dashboard" 
              className="btn"
              style={{
                backgroundColor: isActive('/dashboard') ? 'var(--primary-light)' : 'transparent',
                color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                border: 'none',
                fontWeight: isActive('/dashboard') ? 600 : 500
              }}
            >
              <LayoutDashboard size={16} />
              Mis Boletas
            </Link>

            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="btn"
                style={{
                  backgroundColor: isActive('/admin') ? 'var(--danger-light)' : 'transparent',
                  color: isActive('/admin') ? 'var(--danger-text)' : 'var(--text-secondary)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  border: 'none',
                  fontWeight: isActive('/admin') ? 600 : 500
                }}
              >
                <ShieldAlert size={16} />
                Panel Admin
              </Link>
            )}
          </div>

          {/* Separador vertical */}
          <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'var(--border)' }}></div>

          {/* Selector de Tema y Usuario */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Toggle de Tema */}
            <button 
              onClick={toggleTheme}
              className="btn btn-secondary"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                padding: 0,
                borderRadius: 'var(--radius-md)'
              }}
            >
              {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--warning)' }} /> : <Moon size={18} style={{ color: 'var(--primary)' }} />}
            </button>

            {/* Datos del Usuario */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-card-hover)',
              padding: '0.375rem 0.875rem 0.375rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)'
            }}>
              <div className="flex-center" style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={12} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2'
                }}>
                  {user?.name}
                </span>
                <span className="badge" style={{
                  fontSize: '0.6rem',
                  padding: '0 0.375rem',
                  width: 'fit-content',
                  backgroundColor: user?.role === 'admin' ? 'var(--danger-light)' : 'var(--primary-light)',
                  color: user?.role === 'admin' ? 'var(--danger-text)' : 'var(--primary)',
                  marginTop: '1px'
                }}>
                  {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </div>
            </div>

            {/* Botón Logout */}
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              title="Cerrar Sesión"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                padding: 0,
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                borderColor: 'transparent'
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Botones de control móvil (Tema + Hamburguesa) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }} className="mobile-controls">
          {/* Toggle de Tema Móvil */}
          <button 
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{
              width: '2.25rem',
              height: '2.25rem',
              padding: 0,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}
          >
            {theme === 'dark' ? <Sun size={16} style={{ color: 'var(--warning)' }} /> : <Moon size={16} style={{ color: 'var(--primary)' }} />}
          </button>

          {/* Hamburguesa Menú */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn btn-secondary"
            style={{
              width: '2.25rem',
              height: '2.25rem',
              padding: 0,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Estilos responsivos usando una etiqueta <style> */}
      <style>{`
        .desktop-menu-container {
          display: none !important;
        }
        .mobile-controls {
          display: flex !important;
        }
        @media (min-width: 768px) {
          .desktop-menu-container {
            display: flex !important;
          }
          .mobile-controls {
            display: none !important;
          }
        }
      `}</style>

      {/* Menú Desplegable Móvil */}
      {isMobileMenuOpen && (
        <div className="glass animate-fade-in" style={{
          position: 'absolute',
          top: '4.5rem',
          left: 0,
          width: '100%',
          borderBottom: '1px solid var(--border)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 49
        }}>
          {/* Info de Usuario Móvil */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <div className="flex-center" style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 600
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={14} />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
            </div>
            <span className="badge" style={{
              marginLeft: 'auto',
              backgroundColor: user?.role === 'admin' ? 'var(--danger-light)' : 'var(--primary-light)',
              color: user?.role === 'admin' ? 'var(--danger-text)' : 'var(--primary)'
            }}>
              {user?.role === 'admin' ? 'Admin' : 'Cliente'}
            </span>
          </div>

          {/* Links Navegación Móvil */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link 
              to="/dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn"
              style={{
                backgroundColor: isActive('/dashboard') ? 'var(--primary-light)' : 'transparent',
                color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-secondary)',
                justifyContent: 'flex-start',
                border: 'none',
                width: '100%'
              }}
            >
              <LayoutDashboard size={18} />
              Mis Boletas
            </Link>

            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn"
                style={{
                  backgroundColor: isActive('/admin') ? 'var(--danger-light)' : 'transparent',
                  color: isActive('/admin') ? 'var(--danger-text)' : 'var(--text-secondary)',
                  justifyContent: 'flex-start',
                  border: 'none',
                  width: '100%'
                }}
              >
                <ShieldAlert size={18} />
                Panel Admin
              </Link>
            )}
          </div>

          {/* Botón de Logout Móvil */}
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              color: 'var(--danger)',
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
};
