export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export type GameType = 'Lotería' | 'Rifa' | 'Sorteo' | 'Boleta' | 'Juego ocasional';
export type TicketStatus = 'Pendiente' | 'Ganado' | 'Perdido';

export interface Ticket {
  id: string;
  userId: string;
  title: string;
  gameType: GameType;
  gameNumber?: string;
  gameDate: string; // ISO date string
  amount?: number;
  place?: string;
  status: TicketStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  error: string;
}
