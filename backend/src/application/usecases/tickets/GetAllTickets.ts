import {
  AdminTicketFilters,
  PaginatedTicketsWithOwner,
  TicketRepository,
} from '../../../domain/repositories/TicketRepository';

export class GetAllTickets {
  constructor(private ticketRepository: TicketRepository) {}

  async execute(filters: AdminTicketFilters): Promise<PaginatedTicketsWithOwner> {
    return this.ticketRepository.findAll(filters);
  }
}
