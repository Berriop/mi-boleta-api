import {
  PaginatedTickets,
  TicketFilters,
  TicketRepository,
} from '../../../domain/repositories/TicketRepository';

export class GetTickets {
  constructor(private ticketRepository: TicketRepository) {}

  async execute(userId: string, filters: TicketFilters): Promise<PaginatedTickets> {
    return this.ticketRepository.findAllByUser(userId, filters);
  }
}
