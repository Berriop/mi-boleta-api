import { DomainError } from '../../../domain/errors/DomainError';
import { TicketRepository } from '../../../domain/repositories/TicketRepository';

export class DeleteTicket {
  constructor(private ticketRepository: TicketRepository) {}

  async execute(ticketId: string, userId: string): Promise<void> {
    const deleted = await this.ticketRepository.delete(ticketId, userId);
    if (!deleted) {
      throw new DomainError('Ticket no encontrado', 404);
    }
  }
}
