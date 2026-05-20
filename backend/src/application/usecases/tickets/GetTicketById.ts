import { Ticket } from '../../../domain/entities/Ticket';
import { DomainError } from '../../../domain/errors/DomainError';
import { TicketRepository } from '../../../domain/repositories/TicketRepository';

export class GetTicketById {
  constructor(private ticketRepository: TicketRepository) {}

  async execute(ticketId: string, userId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId, userId);
    if (!ticket) {
      throw new DomainError('Ticket no encontrado', 404);
    }
    return ticket;
  }
}
