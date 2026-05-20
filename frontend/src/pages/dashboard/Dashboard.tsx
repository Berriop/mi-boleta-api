import React, { useState, useEffect } from 'react';
import { apiClient, parseValidationError } from '../../core/api/apiClient';
import type { Ticket, ApiResponse, GameType, TicketStatus } from '../../core/types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Coins, 
  Calendar, 
  Clock, 
  Award,
  AlertCircle,
  FileText,
  MapPin,
  X,
  Loader2
} from 'lucide-react';

const GAME_TYPES: GameType[] = ['Lotería', 'Rifa', 'Sorteo', 'Boleta', 'Juego ocasional'];
const TICKET_STATUSES: TicketStatus[] = ['Pendiente', 'Ganado', 'Perdido'];

const Dashboard: React.FC = () => {
  // Lista de boletas
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterGameType, setFilterGameType] = useState<string>('');
  
  // Drawer / Formulario de Agregar/Editar
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Valores de los inputs del formulario
  const [title, setTitle] = useState('');
  const [gameType, setGameType] = useState<GameType>('Lotería');
  const [gameNumber, setGameNumber] = useState('');
  const [gameDate, setGameDate] = useState('');
  const [amount, setAmount] = useState('');
  const [place, setPlace] = useState('');
  const [status, setStatus] = useState<TicketStatus>('Pendiente');
  const [notes, setNotes] = useState('');

  // Modal de confirmación de eliminación
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar boletas
  const fetchTickets = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      // Construir query params
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filterStatus) params.append('status', filterStatus);
      if (filterGameType) params.append('gameType', filterGameType);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get<ApiResponse<Ticket[]>>(`/tickets${queryStr}`);
      
      setTickets(response.data || []);
    } catch (error: any) {
      setGeneralError(error.message || 'Error al cargar las boletas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [searchQuery, filterStatus, filterGameType]);

  // Abrir formulario para agregar
  const handleOpenAdd = () => {
    setEditingTicket(null);
    setTitle('');
    setGameType('Lotería');
    setGameNumber('');
    // Establecer fecha por defecto (hoy) en formato local YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    setGameDate(today);
    setAmount('');
    setPlace('');
    setStatus('Pendiente');
    setNotes('');
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  // Abrir formulario para editar
  const handleOpenEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setTitle(ticket.title);
    setGameType(ticket.gameType);
    setGameNumber(ticket.gameNumber || '');
    // Formatear fecha para el input type="date" (YYYY-MM-DD)
    const dateFormatted = ticket.gameDate ? ticket.gameDate.split('T')[0] : '';
    setGameDate(dateFormatted);
    setAmount(ticket.amount ? ticket.amount.toString() : '');
    setPlace(ticket.place || '');
    setStatus(ticket.status);
    setNotes(ticket.notes || '');
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  // Guardar boleta (Crear o Editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    // Validaciones Locales Básicas
    const localErrors: Record<string, string> = {};
    if (!title.trim()) localErrors.title = 'El título es requerido';
    if (!gameDate) localErrors.gameDate = 'La fecha del sorteo es requerida';
    if (amount && isNaN(Number(amount))) localErrors.amount = 'El monto debe ser un número válido';
    if (amount && Number(amount) < 0) localErrors.amount = 'El monto no puede ser negativo';

    if (Object.keys(localErrors).length > 0) {
      setFormErrors(localErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        gameType,
        gameNumber: gameNumber.trim() || undefined,
        gameDate: new Date(gameDate).toISOString(),
        amount: amount ? Number(amount) : undefined,
        place: place.trim() || undefined,
        status,
        notes: notes.trim() || undefined
      };

      if (editingTicket) {
        // Actualizar
        await apiClient.put<ApiResponse<Ticket>>(`/tickets/${editingTicket.id}`, payload);
      } else {
        // Crear
        await apiClient.post<ApiResponse<Ticket>>('/tickets', payload);
      }

      setIsDrawerOpen(false);
      fetchTickets();
    } catch (error: any) {
      const parsedErrors = parseValidationError(error.message);
      setFormErrors(parsedErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!deletingTicket) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/tickets/${deletingTicket.id}`);
      setDeletingTicket(null);
      fetchTickets();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar la boleta');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calcular KPIs
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === 'Pendiente').length;
  const wonTickets = tickets.filter(t => t.status === 'Ganado').length;
  const totalInvestment = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Formateadores auxiliares
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '$0';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Formato dd/mm/yyyy en zona horaria local
      return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Cabecera del Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
            Mis Sorteos y Boletas
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Administra tus números de la suerte, revisa sus estados y mantén un historial de tus jugadas.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ height: '2.75rem', padding: '0 1.25rem' }}
        >
          <Plus size={18} />
          Registrar Boleta
        </button>
      </div>

      {/* Grid de KPIs / Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* KPI: Total Boletas */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
          <div className="flex-center" style={{
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Registradas</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2' }}>{totalTickets}</div>
          </div>
        </div>

        {/* KPI: Inversión Total */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="flex-center" style={{
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)'
          }}>
            <Coins size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Inversión Total</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2' }}>{formatCurrency(totalInvestment)}</div>
          </div>
        </div>

        {/* KPI: Pendientes */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="flex-center" style={{
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--pending-light)',
            color: 'var(--pending-text)'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Por Jugar / Pendientes</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2' }}>{pendingTickets}</div>
          </div>
        </div>

        {/* KPI: Ganados */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="flex-center" style={{
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--won-light)',
            color: 'var(--won-text)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Ganadas</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2' }}>{wonTickets}</div>
          </div>
        </div>
      </div>

      {/* Controles de Filtros y Búsqueda */}
      <div className="card glass" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: '1rem', 
        flexWrap: 'wrap',
        padding: '1.25rem'
      }}>
        {/* Input de Búsqueda */}
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input 
            type="text" 
            placeholder="Buscar por título o número de boleta..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.75rem', height: '2.75rem' }}
          />
        </div>

        {/* Filtro Tipo Juego */}
        <div style={{ flex: '1 1 180px' }}>
          <select 
            className="form-input"
            value={filterGameType}
            onChange={(e) => setFilterGameType(e.target.value)}
            style={{ height: '2.75rem', cursor: 'pointer' }}
          >
            <option value="">Todos los Tipos</option>
            {GAME_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Filtro Estado */}
        <div style={{ flex: '1 1 180px' }}>
          <select 
            className="form-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: '2.75rem', cursor: 'pointer' }}
          >
            <option value="">Todos los Estados</option>
            {TICKET_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Listado de Boletas */}
      {generalError && (
        <div className="card animate-fade-in" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} style={{ color: 'var(--danger-text)' }} />
          <span style={{ color: 'var(--danger-text)', fontWeight: 500 }}>{generalError}</span>
        </div>
      )}

      {isLoading ? (
        /* Loader con Skeletons */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: '200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '8px' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <div className="skeleton" style={{ width: '60%', height: '18px' }}></div>
                  <div className="skeleton" style={{ width: '40%', height: '14px' }}></div>
                </div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: '32px', marginTop: 'auto' }}></div>
            </div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        /* Estado Vacío Premium */
        <div className="card flex-center animate-fade-in" style={{ 
          flexDirection: 'column', 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          gap: '1.25rem',
          borderStyle: 'dashed',
          borderColor: 'var(--text-muted)'
        }}>
          <div className="flex-center" style={{
            width: '5rem',
            height: '5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            marginBottom: '0.5rem'
          }}>
            <FileText size={40} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Sin resultados encontrados
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem' }}>
              {searchQuery || filterStatus || filterGameType 
                ? 'Ninguna boleta coincide con los filtros aplicados. Intenta cambiarlos o limpiar la búsqueda.'
                : 'Aún no tienes boletas registradas en tu cuenta. ¡Crea tu primera boleta para empezar a monitorearla!'}
            </p>
          </div>
          {!searchQuery && !filterStatus && !filterGameType ? (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={18} />
              Registrar Primera Boleta
            </button>
          ) : (
            <button onClick={() => { setSearchQuery(''); setFilterStatus(''); setFilterGameType(''); }} className="btn btn-secondary">
              Limpiar Filtros
            </button>
          )}
        </div>
      ) : (
        /* Grid de Tarjetas de Boletas */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem'
        }}>
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              className="card card-hover animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                position: 'relative'
              }}
            >
              {/* Encabezado: Título + Badge de Tipo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.15rem', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)',
                    lineHeight: '1.3',
                    wordBreak: 'break-word'
                  }}>
                    {ticket.title}
                  </h3>
                  <span className="badge badge-pending" style={{
                    width: 'fit-content',
                    fontSize: '0.65rem',
                    padding: '0.125rem 0.5rem',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)'
                  }}>
                    {ticket.gameType}
                  </span>
                </div>

                {/* Badge de Estado */}
                <span className={`badge ${
                  ticket.status === 'Ganado' ? 'badge-won' : 
                  ticket.status === 'Perdido' ? 'badge-lost' : 'badge-pending'
                }`}>
                  {ticket.status}
                </span>
              </div>

              {/* Contenido / Atributos del Ticket */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.75rem 1rem', 
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                padding: '0.875rem 0'
              }}>
                {/* Número */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={14} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Número</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ticket.gameNumber || 'N/A'}</div>
                  </div>
                </div>

                {/* Fecha */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sorteo</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(ticket.gameDate)}</div>
                  </div>
                </div>

                {/* Valor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Coins size={14} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Valor</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(ticket.amount || undefined)}</div>
                  </div>
                </div>

                {/* Lugar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Lugar / Lotería</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                      {ticket.place || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas del Ticket */}
              {ticket.notes && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)', 
                  backgroundColor: 'var(--bg-card-hover)', 
                  padding: '0.625rem 0.875rem', 
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--primary)',
                  fontStyle: 'italic',
                  wordBreak: 'break-word',
                  maxHeight: '4.5rem',
                  overflowY: 'auto'
                }}>
                  "{ticket.notes}"
                </div>
              )}

              {/* Acciones de Tarjeta */}
              <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                marginTop: 'auto',
                paddingTop: '0.25rem'
              }}>
                <button 
                  onClick={() => handleOpenEdit(ticket)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                >
                  <Edit3 size={14} />
                  Editar
                </button>
                <button 
                  onClick={() => setDeletingTicket(ticket)}
                  className="btn btn-secondary"
                  style={{ 
                    padding: '0.5rem 0.75rem', 
                    fontSize: '0.85rem',
                    color: 'var(--danger)',
                    borderColor: 'transparent'
                  }}
                  title="Eliminar Boleta"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER DESLIZABLE / FORMULARIO PARA REGISTRAR O EDITAR BOLETAS */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Fondo clickeable para cerrar */}
          <div 
            onClick={() => !isSubmitting && setIsDrawerOpen(false)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99 }}
          ></div>

          {/* Drawer Real */}
          <div className="card glass animate-fade-in" style={{
            position: 'relative',
            zIndex: 100,
            width: '100%',
            maxWidth: '480px',
            height: '100%',
            borderRadius: 0,
            borderLeft: '1px solid var(--border)',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-premium)'
          }}>
            {/* Header del Drawer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                  {editingTicket ? 'Editar Boleta' : 'Registrar Nueva Boleta'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {editingTicket ? 'Modifica los campos que desees actualizar.' : 'Completa los campos para hacer seguimiento a tu sorteo.'}
                </p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                disabled={isSubmitting}
                className="btn btn-secondary"
                style={{ width: '2.25rem', height: '2.25rem', padding: 0, borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              
              {/* Título (Obligatorio) */}
              <div className="form-group">
                <label className="form-label">Título de la Boleta / Sorteo *</label>
                <input 
                  type="text" 
                  className={`form-input ${formErrors.title ? 'error' : ''}`}
                  placeholder="Ej: Lotería de Medellín, Rifa del carro..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.title && <span className="form-error">{formErrors.title}</span>}
              </div>

              {/* Grid: Tipo de Juego + Número */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Tipo de Juego */}
                <div className="form-group">
                  <label className="form-label">Tipo de Juego *</label>
                  <select 
                    className="form-input"
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value as GameType)}
                    disabled={isSubmitting}
                  >
                    {GAME_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Número de Boleta */}
                <div className="form-group">
                  <label className="form-label">Número Jugado</label>
                  <input 
                    type="text" 
                    className={`form-input ${formErrors.gameNumber ? 'error' : ''}`}
                    placeholder="Ej: 4567, 12"
                    value={gameNumber}
                    onChange={(e) => setGameNumber(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {formErrors.gameNumber && <span className="form-error">{formErrors.gameNumber}</span>}
                </div>
              </div>

              {/* Grid: Fecha Sorteo + Valor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Fecha */}
                <div className="form-group">
                  <label className="form-label">Fecha del Sorteo *</label>
                  <input 
                    type="date" 
                    className={`form-input ${formErrors.gameDate ? 'error' : ''}`}
                    value={gameDate}
                    onChange={(e) => setGameDate(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  {formErrors.gameDate && <span className="form-error">{formErrors.gameDate}</span>}
                </div>

                {/* Valor */}
                <div className="form-group">
                  <label className="form-label">Monto Invertido ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    className={`form-input ${formErrors.amount ? 'error' : ''}`}
                    placeholder="Ej: 10000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {formErrors.amount && <span className="form-error">{formErrors.amount}</span>}
                </div>
              </div>

              {/* Grid: Lugar / Entidad + Estado */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Lugar / Entidad */}
                <div className="form-group">
                  <label className="form-label">Lugar / Lotería</label>
                  <input 
                    type="text" 
                    className={`form-input ${formErrors.place ? 'error' : ''}`}
                    placeholder="Ej: Paga Todo, Éxito..."
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {formErrors.place && <span className="form-error">{formErrors.place}</span>}
                </div>

                {/* Estado */}
                <div className="form-group">
                  <label className="form-label">Estado de la Boleta *</label>
                  <select 
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TicketStatus)}
                    disabled={isSubmitting}
                  >
                    {TICKET_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notas */}
              <div className="form-group">
                <label className="form-label">Notas Adicionales / Serie</label>
                <textarea 
                  className={`form-input ${formErrors.notes ? 'error' : ''}`}
                  placeholder="Ej: Serie 012, comprado con amigos de la universidad..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  style={{ resize: 'vertical', minHeight: '80px', maxHeight: '180px' }}
                />
                {formErrors.notes && <span className="form-error">{formErrors.notes}</span>}
              </div>

              {/* Acciones del Formulario */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button 
                  type="button" 
                  onClick={() => setIsDrawerOpen(false)}
                  disabled={isSubmitting}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Boleta'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIÁLOGO / MODAL PERSONALIZADO DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {/* ========================================================================= */}
      {deletingTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Modal Real */}
          <div className="card glass animate-fade-in" style={{
            width: '100%',
            maxWidth: '440px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            padding: '2rem 1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Cabecera del Diálogo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)' }}>
              <div className="flex-center" style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)'
              }}>
                <Trash2 size={18} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ¿Eliminar esta boleta?
              </h3>
            </div>

            {/* Mensaje Informativo */}
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              ¿Estás seguro de que deseas eliminar permanentemente la boleta de <strong>"{deletingTicket.title}"</strong>{deletingTicket.gameNumber ? ` con el número ${deletingTicket.gameNumber}` : ''}? Esta acción no se puede deshacer.
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button 
                onClick={() => setDeletingTicket(null)}
                disabled={isDeleting}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="btn btn-danger"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animaciones CSS inyectadas */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default Dashboard;
