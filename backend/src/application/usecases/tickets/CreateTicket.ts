import { TicketRepository } from '../../../domain/repositories/TicketRepository';
import { Ticket } from '../../../domain/entities/Ticket';

export type CreateTicketInput = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;

export class CreateTicket {
  constructor(private ticketRepository: TicketRepository) {}

  async execute(input: CreateTicketInput): Promise<Ticket> {
    return this.ticketRepository.create(input);
  }
}
