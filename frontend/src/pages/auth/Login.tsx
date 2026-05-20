import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../core/store/authContext';
import { parseValidationError } from '../../core/api/apiClient';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showExpiredWarning, setShowExpiredWarning] = useState(false);

  // Redirigir si ya está autenticado
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Capturar si la sesión expiró
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setShowExpiredWarning(true);
    }
  }, [searchParams]);

  // Validaciones del lado del cliente
  const validateForm = (): boolean => {
    const tempErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      tempErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(email)) {
      tempErrors.email = 'El formato del correo electrónico no es válido.';
    }

    if (!password) {
      tempErrors.password = 'La contraseña es obligatoria.';
    } else if (password.length < 8) {
      tempErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setShowExpiredWarning(false);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      // La redirección ocurrirá automáticamente por el useEffect de isAuthenticated
    } catch (error: any) {
      const errorMsg = error.message || 'Error al iniciar sesión';
      
      if (errorMsg.startsWith('Datos inválidos:')) {
        // Error de validación del backend (class-validator)
        const parsedErrors = parseValidationError(errorMsg);
        setErrors(parsedErrors);
      } else {
        // Credenciales inválidas (401) u otros errores generales (404/500/Red)
        setGeneralError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', padding: '1.5rem', backgroundColor: 'var(--bg-app)' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', boxShadow: 'var(--shadow-premium)' }}>
        
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex-center" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', margin: '0 auto 1rem', boxShadow: 'var(--shadow-sm)' }}>
            <LogIn size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>¡Bienvenido!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Inicia sesión para administrar tus boletas y sorteos
          </p>
        </div>

        {/* Advertencia de Sesión Expirada */}
        {showExpiredWarning && (
          <div className="animate-fade-in" style={{ backgroundColor: 'var(--pending-light)', border: '1px solid var(--pending)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pending-text)', fontSize: '0.85rem', fontWeight: 500 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>Tu sesión ha expirado por seguridad. Por favor, inicia sesión de nuevo.</span>
          </div>
        )}

        {/* Error General del Backend (Ej. 401 Credenciales Inválidas) */}
        {generalError && (
          <div className="animate-fade-in" style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-text)', fontSize: '0.85rem', fontWeight: 500 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{generalError}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: errors.email ? 'var(--danger)' : 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem' }}
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                disabled={isLoading}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: errors.password ? 'var(--danger)' : 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Enlace a Registro */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          ¿No tienes una cuenta?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
