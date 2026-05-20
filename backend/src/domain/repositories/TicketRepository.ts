import { GameType, Ticket, TicketStatus } from '../entities/Ticket';

export type TicketFilters = {
  status?: TicketStatus;
  gameType?: GameType;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type AdminTicketFilters = TicketFilters & {
  userId?: string;
};

export type TicketWithOwner = Ticket & {
  owner: { id: string; name: string; email: string };
};

export type PaginatedTickets = {
  items: Ticket[];
  total: number;
  page: number;
  pageSize: number;
};

export type PaginatedTicketsWithOwner = {
  items: TicketWithOwner[];
  total: number;
  page: number;
  pageSize: number;
};

export interface TicketRepository {
  create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket>;
  findAllByUser(userId: string, filters: TicketFilters): Promise<PaginatedTickets>;
  findAll(filters: AdminTicketFilters): Promise<PaginatedTicketsWithOwner>;
  findById(ticketId: string, userId: string): Promise<Ticket | null>;
  update(
    ticketId: string,
    userId: string,
    updates: Partial<Omit<Ticket, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Ticket | null>;
  delete(ticketId: string, userId: string): Promise<boolean>;
}
