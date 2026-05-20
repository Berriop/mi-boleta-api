import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../core/store/authContext';
import { parseValidationError } from '../../core/api/apiClient';
import { User, Mail, Lock, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Register: React.FC = () => {
  const { register, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estados del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toggles de contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validaciones del lado del cliente
  const validateForm = (): boolean => {
    const tempErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      tempErrors.name = 'El nombre completo es obligatorio.';
    } else if (name.trim().length < 2 || name.trim().length > 80) {
      tempErrors.name = 'El nombre debe tener entre 2 y 80 caracteres.';
    }

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

    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Debes confirmar tu contraseña.';
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 1. Registrar al usuario en la API
      await register(name, email, password);

      // 2. Experiencia de Usuario Seamless: Iniciar sesión automáticamente tras el registro exitoso
      await login(email, password);

      // La redirección ocurrirá automáticamente por el useEffect de isAuthenticated
    } catch (error: any) {
      const errorMsg = error.message || 'Error al registrar usuario';

      if (errorMsg.includes('ya registrado') || errorMsg.includes('conflict') || errorMsg.includes('exist')) {
        // Conflicto de email duplicado (409)
        setErrors({ email: 'Este correo electrónico ya está registrado.' });
      } else if (errorMsg.startsWith('Datos inválidos:')) {
        // Errores de validación del backend (class-validator)
        const parsedErrors = parseValidationError(errorMsg);
        setErrors(parsedErrors);
      } else {
        // Otros errores generales
        setGeneralError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', padding: '1.5rem', backgroundColor: 'var(--bg-app)' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', boxShadow: 'var(--shadow-premium)' }}>

        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex-center" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', margin: '0 auto 1rem', boxShadow: 'var(--shadow-sm)' }}>
            <UserPlus size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Crear Cuenta</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Únete y lleva el control organizado de todos tus sorteos
          </p>
        </div>

        {/* Error General del Backend */}
        {generalError && (
          <div className="animate-fade-in" style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-text)', fontSize: '0.85rem', fontWeight: 500 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{generalError}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Nombre completo */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nombre Completo</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: errors.name ? 'var(--danger)' : 'var(--text-muted)' }}>
                <User size={18} />
              </span>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                disabled={isLoading}
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

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
                placeholder="Mínimo 8 caracteres"
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

          {/* Confirmar contraseña */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: errors.confirmPassword ? 'var(--danger)' : 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Registrando y conectando...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Enlace a Login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Inicia sesión aquí
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
