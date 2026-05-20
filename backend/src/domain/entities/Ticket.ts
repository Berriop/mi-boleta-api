export const GAME_TYPES = [
  'Lotería',
  'Rifa',
  'Sorteo',
  'Boleta',
  'Juego ocasional',
] as const;

export const TICKET_STATUSES = ['Pendiente', 'Ganado', 'Perdido'] as const;

export type GameType = (typeof GAME_TYPES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type Ticket = {
  id: string;
  userId: string;
  title: string;
  gameType: GameType;
  gameNumber?: string | null;
  gameDate: Date;
  amount?: number | null;
  place?: string | null;
  status: TicketStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
