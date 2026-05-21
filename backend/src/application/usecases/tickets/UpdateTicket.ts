import { TicketRepository } from '../../../domain/repositories/TicketRepository';
import { Ticket } from '../../../domain/entities/Ticket';
import { DomainError } from '../../../domain/errors/DomainError';

export type UpdateTicketInput = Partial<
  Omit<Ticket, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export class UpdateTicket {
  constructor(private ticketRepository: TicketRepository) {}

  async execute(
    ticketId: string,
    userId: string,
    updates: UpdateTicketInput,
    isAdmin?: boolean
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.update(ticketId, userId, updates, isAdmin);
    if (!ticket) {
      throw new DomainError('Ticket no encontrado', 404);
    }
    return ticket;
  }
}
