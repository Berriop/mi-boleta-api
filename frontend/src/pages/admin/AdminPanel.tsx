import React, { useState, useEffect } from 'react';
import { apiClient } from '../../core/api/apiClient';
import type { Ticket, ApiResponse, GameType, TicketStatus, ApiMeta } from '../../core/types';
import { 
  Search, 
  Trash2, 
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
  Mail
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

  // Modal de confirmación para eliminar
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Confirmar eliminación (como administrador)
  const handleDeleteConfirm = async () => {
    if (!deletingTicket) return;
    setIsDeleting(true);
    try {
      // Nota: El endpoint DELETE /tickets/:id valida pertenencia a menos que esté adaptado
      // Pero eliminamos llamando al endpoint general del backend
      await apiClient.delete(`/tickets/${deletingTicket.id}`);
      setDeletingTicket(null);
      fetchAdminTickets();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar la boleta');
    } finally {
      setIsDeleting(false);
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
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
          Panel de Administración Global
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
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
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Boletas Totales (Sistema)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2' }}>{totalItems}</div>
          </div>
        </div>

        {/* KPI: Monto Global Jugado */}
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
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Inversión (Esta Página)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2' }}>{formatCurrency(totalInvestment)}</div>
          </div>
        </div>

        {/* KPI: Pendientes Globales */}
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
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Pendientes (Esta Página)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2' }}>{pendingCount}</div>
          </div>
        </div>

        {/* KPI: Ganados Globales */}
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
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Ganadas (Esta Página)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.2' }}>{wonCount}</div>
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
            placeholder="Buscar por título, número, dueño o email..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.75rem', height: '2.75rem' }}
          />
        </div>

        {/* Filtro Tipo Juego */}
        <div style={{ flex: '1 1 150px' }}>
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
        <div style={{ flex: '1 1 150px' }}>
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

        {/* Selector de Tamaño de Página */}
        <div style={{ flex: '0 0 120px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Filas:</span>
          <select 
            className="form-input"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{ height: '2.75rem', cursor: 'pointer', padding: '0 0.5rem' }}
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
          borderColor: 'var(--text-muted)'
        }}>
          <div className="flex-center" style={{
            width: '5rem',
            height: '5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            marginBottom: '0.5rem'
          }}>
            <FileText size={40} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Sin resultados encontrados en el sistema
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem' }}>
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
        /* Grid de Tarjetas de Boletas Globales con Detalles del Dueño */
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
                position: 'relative',
                borderLeft: '4px solid var(--danger)' // Color rojo distintivo para boletas en panel admin
              }}
            >
              {/* Información del Propietario (Diferenciador del Admin) */}
              {ticket.owner && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-card-hover)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem'
                }}>
                  <UserIcon size={14} style={{ color: 'var(--danger-text)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      Dueño: {ticket.owner.name}
                    </span>
                    <span style={{ 
                      fontSize: '0.725rem', 
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <Mail size={10} />
                      {ticket.owner.email}
                    </span>
                  </div>
                </div>
              )}

              {/* Título + Badge de Tipo */}
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

              {/* Botón de Acciones (Administración para Moderación) */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
                <button 
                  onClick={() => setDeletingTicket(ticket)}
                  className="btn btn-secondary"
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    color: 'var(--danger)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <Trash2 size={15} />
                  Eliminar Boleta (Moderación)
                </button>
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
          padding: '1rem 1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Mostrando <strong>{tickets.length}</strong> de <strong>{totalItems}</strong> boletas
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Botón Anterior */}
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)' }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Indicador de Páginas */}
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Página {page} de {meta.totalPages}
            </span>

            {/* Botón Siguiente */}
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)' }}
            >
              <ChevronRight size={16} />
            </button>
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
                ¿Eliminar boleta (Moderación)?
              </h3>
            </div>

            {/* Mensaje Informativo */}
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Como administrador, estás a punto de eliminar permanentemente la boleta de <strong>"{deletingTicket.title}"</strong> perteneciente al usuario <strong>"{deletingTicket.owner?.name}"</strong>. Esta acción no se puede deshacer.
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
                  'Confirmar Eliminación'
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

export default AdminPanel;
