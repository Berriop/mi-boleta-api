import React, { useState, useEffect } from 'react';
import { apiClient } from '../../core/api/apiClient';
import type { Ticket, ApiResponse, GameType, TicketStatus, ApiMeta } from '../../core/types';
import { 
  Search, 
  TrendingUp, 
  Coins, 
  Calendar, 
  Clock, 
  Award,
  AlertCircle,
  FileText,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Check,
  X,
  RotateCcw
} from 'lucide-react';

const GAME_TYPES: GameType[] = ['Lotería', 'Rifa', 'Sorteo', 'Boleta', 'Juego ocasional'];
const TICKET_STATUSES: TicketStatus[] = ['Pendiente', 'Ganado', 'Perdido'];

const AdminPanel: React.FC = () => {
  // Estado de datos
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Filtros y Paginación
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterGameType, setFilterGameType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  // Cargar boletas de administración
  const fetchAdminTickets = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filterStatus) params.append('status', filterStatus);
      if (filterGameType) params.append('gameType', filterGameType);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      const response = await apiClient.get<ApiResponse<Ticket[]>>(`/admin/tickets?${params.toString()}`);
      
      setTickets(response.data || []);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (error: any) {
      setGeneralError(error.message || 'Error al cargar las boletas del panel de administración');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Resetear a la página 1 cuando cambia algún filtro
    setPage(1);
  }, [searchQuery, filterStatus, filterGameType, pageSize]);

  useEffect(() => {
    fetchAdminTickets();
  }, [page, pageSize, searchQuery, filterStatus, filterGameType]);



  // Actualizar estado de la boleta (como administrador)
  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    setUpdatingTicketId(ticketId);
    try {
      await apiClient.put(`/tickets/${ticketId}`, { status: newStatus });
      fetchAdminTickets();
    } catch (error: any) {
      alert(error.message || 'Error al actualizar el estado de la boleta');
    } finally {
      setUpdatingTicketId(null);
    }
  };

  // Calcular KPIs basados en lo que tenemos cargado
  const totalItems = meta?.total || tickets.length;
  const wonCount = tickets.filter(t => t.status === 'Ganado').length;
  const pendingCount = tickets.filter(t => t.status === 'Pendiente').length;
  const totalInvestment = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Formateadores auxiliares
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '$0';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Cabecera del Panel */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
          Panel de Administración Global
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Monitorea, filtra y gestiona todas las boletas y sorteos de todos los usuarios registrados en el sistema.
        </p>
      </div>

      {/* Grid de KPIs / Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* KPI: Total Boletas Globales */}
        <div className="card card-hover" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.25rem',
          borderLeft: '3px solid var(--primary)'
        }}>
          <div className="flex-center" style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            boxShadow: '0 0 8px var(--primary-light)'
          }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Boletas Totales (Sistema)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2', marginTop: '2px', fontFamily: 'var(--font-display)' }}>{totalItems}</div>
          </div>
        </div>

        {/* KPI: Monto Global Jugado */}
        <div className="card card-hover" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.25rem',
          borderLeft: '3px solid var(--success)'
        }}>
          <div className="flex-center" style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            boxShadow: '0 0 8px var(--success-light)'
          }}>
            <Coins size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inversión (Esta Página)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2', marginTop: '2px', fontFamily: 'var(--font-display)' }}>{formatCurrency(totalInvestment)}</div>
          </div>
        </div>

        {/* KPI: Pendientes Globales */}
        <div className="card card-hover" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.25rem',
          borderLeft: '3px solid var(--warning)'
        }}>
          <div className="flex-center" style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--warning-light)',
            color: 'var(--warning)',
            boxShadow: '0 0 8px var(--warning-light)'
          }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendientes (Esta Página)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2', marginTop: '2px', fontFamily: 'var(--font-display)' }}>{pendingCount}</div>
          </div>
        </div>

        {/* KPI: Ganados Globales */}
        <div className="card card-hover" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.25rem',
          borderLeft: '3px solid var(--success)'
        }}>
          <div className="flex-center" style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--won-light)',
            color: 'var(--won-text)',
            boxShadow: '0 0 8px var(--won-light)'
          }}>
            <Award size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ganadas (Esta Página)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2', marginTop: '2px', fontFamily: 'var(--font-display)' }}>{wonCount}</div>
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
        padding: '1rem'
      }}>
        {/* Input de Búsqueda */}
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input 
            type="text" 
            placeholder="Buscar por título, número, dueño o email..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: '2.5rem' }}
          />
        </div>

        {/* Filtro Tipo Juego */}
        <div style={{ flex: '1 1 150px' }}>
          <select 
            className="form-input"
            value={filterGameType}
            onChange={(e) => setFilterGameType(e.target.value)}
            style={{ height: '2.5rem', cursor: 'pointer' }}
          >
            <option value="">Todos los Tipos</option>
            {GAME_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Filtro Estado */}
        <div style={{ flex: '1 1 150px' }}>
          <select 
            className="form-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: '2.5rem', cursor: 'pointer' }}
          >
            <option value="">Todos los Estados</option>
            {TICKET_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Selector de Tamaño de Página */}
        <div style={{ flex: '0 0 120px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filas:</span>
          <select 
            className="form-input"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{ height: '2.5rem', cursor: 'pointer', padding: '0 0.5rem' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Errores */}
      {generalError && (
        <div className="card animate-fade-in" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} style={{ color: 'var(--danger-text)' }} />
          <span style={{ color: 'var(--danger-text)', fontWeight: 500 }}>{generalError}</span>
        </div>
      )}

      {/* Listado de Boletas Globales */}
      {isLoading ? (
        /* Loader con Skeletons */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: '220px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        /* Estado Vacío */
        <div className="card flex-center animate-fade-in" style={{ 
          flexDirection: 'column', 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          gap: '1.25rem',
          borderStyle: 'dashed',
          borderColor: 'var(--border)'
        }}>
          <div className="flex-center" style={{
            width: '4rem',
            height: '4rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            marginBottom: '0.5rem'
          }}>
            <FileText size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Sin resultados encontrados en el sistema
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '0.875rem' }}>
              No se han encontrado boletas registradas de ningún usuario bajo los filtros actuales.
            </p>
          </div>
          {(searchQuery || filterStatus || filterGameType) && (
            <button onClick={() => { setSearchQuery(''); setFilterStatus(''); setFilterGameType(''); }} className="btn btn-secondary">
              Limpiar Filtros
            </button>
          )}
        </div>
      ) : (
        /* Grid de Talonarios de Boletas Globales */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '1.5rem'
        }}>
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              className="ticket-stub animate-fade-in"
              style={{
                borderLeft: '3px solid var(--danger)' // Color rojo distintivo para administración
              }}
            >
              {/* Parte Izquierda: Información de la boleta + Dueño */}
              <div className="ticket-stub-main">
                {/* Dueño de la boleta */}
                {ticket.owner && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'rgba(244, 63, 94, 0.05)',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(244, 63, 94, 0.15)',
                    fontSize: '0.75rem',
                    marginBottom: '0.25rem'
                  }}>
                    <UserIcon size={12} style={{ color: 'var(--danger-text)' }} />
                    <div style={{ display: 'flex', gap: '0.35rem', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {ticket.owner.name}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>|</span>
                      <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.owner.email}
                      </span>
                    </div>
                  </div>
                )}

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
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
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
                  <span className={`status-dot ${
                    ticket.status === 'Ganado' ? 'status-dot-won' :
                    ticket.status === 'Perdido' ? 'status-dot-lost' : 'status-dot-pending'
                  }`}></span>
                  <span>{ticket.status}</span>
                </div>

                {/* Acciones de Moderación de Estado */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                  {updatingTicketId === ticket.id ? (
                    <div className="flex-center" style={{ gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Loader2 className="animate-spin" size={12} />
                      <span>Actualizando...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.35rem', width: '100%' }}>
                      {ticket.status === 'Pendiente' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'Ganado')}
                            className="btn"
                            style={{
                              flex: 1,
                              fontSize: '0.7rem',
                              height: '1.85rem',
                              padding: '0 0.25rem',
                              backgroundColor: 'var(--success-light)',
                              color: 'var(--success-text)',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <Check size={11} />
                            Ganó
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'Perdido')}
                            className="btn"
                            style={{
                              flex: 1,
                              fontSize: '0.7rem',
                              height: '1.85rem',
                              padding: '0 0.25rem',
                              backgroundColor: 'var(--danger-light)',
                              color: 'var(--danger-text)',
                              border: '1px solid rgba(244, 63, 94, 0.2)'
                            }}
                          >
                            <X size={11} />
                            Perdió
                          </button>
                        </>
                      )}
                      {ticket.status === 'Ganado' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'Perdido')}
                            className="btn"
                            style={{
                              flex: 1,
                              fontSize: '0.7rem',
                              height: '1.85rem',
                              padding: '0 0.25rem',
                              backgroundColor: 'var(--danger-light)',
                              color: 'var(--danger-text)',
                              border: '1px solid rgba(244, 63, 94, 0.2)'
                            }}
                          >
                            <X size={11} />
                            Perdió
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'Pendiente')}
                            className="btn btn-secondary"
                            style={{
                              flex: 1.2,
                              fontSize: '0.7rem',
                              height: '1.85rem',
                              padding: '0 0.25rem',
                              borderColor: 'var(--border)'
                            }}
                          >
                            <RotateCcw size={11} />
                            Pendiente
                          </button>
                        </>
                      )}
                      {ticket.status === 'Perdido' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'Ganado')}
                            className="btn"
                            style={{
                              flex: 1,
                              fontSize: '0.7rem',
                              height: '1.85rem',
                              padding: '0 0.25rem',
                              backgroundColor: 'var(--success-light)',
                              color: 'var(--success-text)',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <Check size={11} />
                            Ganó
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'Pendiente')}
                            className="btn btn-secondary"
                            style={{
                              flex: 1.2,
                              fontSize: '0.7rem',
                              height: '1.85rem',
                              padding: '0 0.25rem',
                              borderColor: 'var(--border)'
                            }}
                          >
                            <RotateCcw size={11} />
                            Pendiente
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTROLES DE PAGINACIÓN */}
      {/* ========================================================================= */}
      {meta && meta.totalPages > 1 && (
        <div className="card glass flex-center" style={{ 
          justifyContent: 'space-between', 
          padding: '0.75rem 1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Mostrando <strong>{tickets.length}</strong> de <strong>{totalItems}</strong> boletas
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Botón Anterior */}
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: 0, width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)' }}
            >
              <ChevronLeft size={14} />
            </button>

            {/* Indicador de Páginas */}
            <span style={{ fontSize: '0.825rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Página {page} de {meta.totalPages}
            </span>

            {/* Botón Siguiente */}
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="btn btn-secondary"
              style={{ padding: 0, width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)' }}
            >
              <ChevronRight size={14} />
            </button>
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

export default AdminPanel;
