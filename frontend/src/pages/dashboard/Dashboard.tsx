import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Check
} from 'lucide-react';

const GAME_TYPES: GameType[] = ['Lotería', 'Rifa', 'Sorteo', 'Boleta', 'Juego ocasional'];
const TICKET_STATUSES: TicketStatus[] = ['Pendiente', 'Ganado', 'Perdido'];

const Dashboard: React.FC = () => {
  // Referencia al formulario
  const formRef = React.useRef<HTMLFormElement>(null);

  // Lista de boletas
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterGameType, setFilterGameType] = useState<string>('');
  const [selectedView, setSelectedView] = useState<'upcoming' | 'finished'>('upcoming');

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
  const [showNumberGenerator, setShowNumberGenerator] = useState(false);

  // Función para generar número aleatorio con N dígitos
  const generateRandomNumber = (digits: number) => {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    setGameNumber(randomNum.toString());
    setShowNumberGenerator(false);
  };

  // Cargar boletas
  const fetchTickets = useCallback(async () => {
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setGeneralError(message || 'Error al cargar las boletas');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterStatus, filterGameType]);

  useEffect(() => {
    const loadTickets = async () => {
      await fetchTickets();
    };

    void loadTickets();
  }, [fetchTickets]);

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

    // Validación basada en la fecha versus hoy
    if (gameDate) {
      try {
        const selectedDate = new Date(gameDate + 'T00:00:00');
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.round((selectedDate.getTime() - today.getTime()) / msPerDay);

        if (diffDays < 0) {
          // Fecha anterior a hoy -> no puede ser Pendiente
          if (status === 'Pendiente') {
            localErrors.status = 'El sorteo ya ha ocurrido; el estado debe ser "Ganado" o "Perdido".';
          }
        } else if (diffDays === 1) {
          // Si juega mañana, forzar pendiente
          if (status !== 'Pendiente') {
            localErrors.status = 'El sorteo no ha jugado aún; el estado debe ser "Pendiente".';
          }
        }
      } catch {
        // Si hay problema al parsear la fecha, se ignora aquí y se deja la validación previa
      }
    }

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const parsedErrors = parseValidationError(message);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      alert(message || 'Error al eliminar la boleta');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calcular KPIs
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === 'Pendiente').length;
  const wonTickets = tickets.filter(t => t.status === 'Ganado').length;
  const finishedTickets = tickets.filter(t => t.status === 'Ganado' || t.status === 'Perdido').length;
  const totalInvestment = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);

  const upcomingTickets = tickets
    .filter((t) => t.status === 'Pendiente')
    .sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());

  const finishedList = tickets
    .filter((t) => t.status === 'Ganado' || t.status === 'Perdido')
    .sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());

  const visibleTickets = selectedView === 'upcoming' ? upcomingTickets : finishedList;

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
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Cabecera del Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Mis Sorteos y Boletas
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Administra tus números de la suerte, revisa sus estados y mantén un historial de tus jugadas.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ height: '2.75rem', padding: '0 1.25rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2', fontFamily: 'var(--font-display)' }}>{totalTickets}</div>
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2', fontFamily: 'var(--font-display)' }}>{formatCurrency(totalInvestment)}</div>
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2', fontFamily: 'var(--font-display)' }}>{pendingTickets}</div>
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2', fontFamily: 'var(--font-display)' }}>{wonTickets}</div>
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

      {/* Selector de vista entre Sorteos Próximos y Pendientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <button
          type="button"
          onClick={() => {
            setFilterStatus('');
            setSelectedView('upcoming');
          }}
          className="card glass"
          style={{
            padding: '1.25rem',
            textAlign: 'left',
            border: selectedView === 'upcoming' ? '1px solid var(--primary)' : '1px solid transparent',
            boxShadow: selectedView === 'upcoming' ? '0 0 0 1px rgba(59, 130, 246, 0.15)' : undefined,
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Sorteos Próximos</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>{upcomingTickets.length}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '12px', backgroundColor: 'var(--pending-light)', color: 'var(--pending-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Ver los sorteos con estado pendiente ordenados por fecha próxima.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setFilterStatus('');
            setSelectedView('finished');
          }}
          className="card glass"
          style={{
            padding: '1.25rem',
            textAlign: 'left',
            border: selectedView === 'finished' ? '1px solid var(--primary)' : '1px solid transparent',
            boxShadow: selectedView === 'finished' ? '0 0 0 1px rgba(59, 130, 246, 0.15)' : undefined,
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Terminados</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>{finishedTickets}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
              <Check size={18} />
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Ver todas las boletas que ya terminaron el sorteo.
          </p>
        </button>
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
      ) : visibleTickets.length === 0 ? (
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
              No hay boletas en esta vista
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem' }}>
              {searchQuery || filterStatus || filterGameType
                ? 'Ninguna boleta coincide con los filtros aplicados en esta vista. Intenta cambiarlos o limpiar la búsqueda.'
                : selectedView === 'upcoming'
                  ? 'No hay sorteos próximos en este momento. Registra una nueva boleta para empezar a seguirlos.'
                  : 'No hay boletas terminadas en este momento. Cambia la vista o agrega una nueva boleta.'}
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
        /* Grid de Talonarios de Boletas */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '1.5rem'
        }}>
          {visibleTickets.map(ticket => (
            <div
              key={ticket.id}
              className="ticket-stub animate-fade-in"
            >
              {/* Parte Izquierda: Información de la boleta */}
              <div className="ticket-stub-main">
                <div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: '1.3',
                    wordBreak: 'break-word',
                    fontFamily: 'var(--font-display)',
                    marginBottom: '0.35rem'
                  }}>
                    {ticket.title}
                  </h3>
                  <span className="badge" style={{
                    fontSize: '0.625rem',
                    padding: '0.15rem 0.5rem',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-display)',
                    borderRadius: '4px'
                  }}>
                    {ticket.gameType}
                  </span>
                </div>

                {/* Grid de atributos */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem 0.75rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  borderTop: '1px dashed var(--border)',
                  paddingTop: '0.75rem'
                }}>
                  {/* Fecha Sorteo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Sorteo</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(ticket.gameDate)}</span>
                    </div>
                  </div>

                  {/* Valor invertido */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Coins size={13} style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Valor</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{formatCurrency(ticket.amount || undefined)}</span>
                    </div>
                  </div>

                  {/* Lugar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', gridColumn: 'span 2' }}>
                    <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Lugar</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ticket.place || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Notas de la boleta si existen */}
                {ticket.notes && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-card-hover)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '2px solid var(--primary)',
                    fontStyle: 'italic',
                    wordBreak: 'break-word',
                    maxHeight: '3rem',
                    overflowY: 'auto',
                    marginTop: '0.25rem'
                  }}>
                    "{ticket.notes}"
                  </div>
                )}
              </div>

              {/* Divisor físico con muescas (notch) */}
              <div className="ticket-stub-divider-container">
                <div className="ticket-stub-notch ticket-stub-notch-top"></div>
                <div className="ticket-stub-divider"></div>
                <div className="ticket-stub-notch ticket-stub-notch-bottom"></div>
              </div>

              {/* Parte Derecha: Número + Estado Micro-LED + Acciones */}
              <div className="ticket-stub-right">
                {/* Número */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Número Jugado</span>
                  <div className="ticket-number-display">
                    {ticket.gameNumber || 'N/A'}
                  </div>
                </div>

                {/* Micro-LED de Estado */}
                <div className="status-dot-container">
                  <span className={`status-dot ${ticket.status === 'Ganado' ? 'status-dot-won' :
                      ticket.status === 'Perdido' ? 'status-dot-lost' : 'status-dot-pending'
                    }`}></span>
                  <span>{ticket.status}</span>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.4rem', width: '100%', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleOpenEdit(ticket)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem', height: '1.85rem' }}
                    title="Editar boleta"
                  >
                    <Edit3 size={12} />
                    Editar
                  </button>
                  <button
                    onClick={() => setDeletingTicket(ticket)}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.35rem',
                      height: '1.85rem',
                      width: '1.85rem',
                      color: 'var(--danger)',
                      borderColor: 'transparent'
                    }}
                    title="Eliminar boleta"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
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
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-premium)'
          }}>
            {/* Header del Drawer */}
            <div style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                style={{ width: '2.25rem', height: '2.25rem', padding: 0, borderRadius: '50%', flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenedor scrollable del formulario */}
            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '1rem' }}>
              {/* Formulario */}
              <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0 1.5rem' }}>

              {/* Aviso de error general (backend) */}
              {formErrors.general && (
                <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', padding: '0.75rem 1rem' }}>
                  <strong>Atención: </strong>
                  <span style={{ marginLeft: '0.5rem' }}>{formErrors.general}</span>
                </div>
              )}

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
                  <label className="form-label">Número de Boleta</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className={`form-input ${formErrors.gameNumber ? 'error' : ''}`}
                      placeholder="Ej: 4567, 12"
                      value={gameNumber}
                      onChange={(e) => setGameNumber(e.target.value)}
                      disabled={isSubmitting}
                      style={{ flex: 1, height: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNumberGenerator(!showNumberGenerator)}
                      disabled={isSubmitting}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '0.5rem 0.75rem',
                        height: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem'
                      }}
                      title="Generar número aleatorio"
                    >
                      🎲
                    </button>
                  </div>
                  {formErrors.gameNumber && <span className="form-error">{formErrors.gameNumber}</span>}
                </div>

                {/* Dropdown generador de números */}
                {showNumberGenerator && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-card-hover)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    gap: '0.5rem',
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    <button
                      type="button"
                      onClick={() => generateRandomNumber(3)}
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      3 dígitos
                    </button>
                    <button
                      type="button"
                      onClick={() => generateRandomNumber(4)}
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      4 dígitos
                    </button>
                    <button
                      type="button"
                      onClick={() => generateRandomNumber(5)}
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      5 dígitos
                    </button>
                  </div>
                )}
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
                  {formErrors.status && <span className="form-error">{formErrors.status}</span>}
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
            </form>
            </div>

            {/* Acciones del Formulario - Fijas al final */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(10px)',
              position: 'sticky',
              bottom: 0,
              zIndex: 101
            }}>
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
                type="button"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ flex: 1.5 }}
                onClick={() => formRef.current?.submit()}
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
