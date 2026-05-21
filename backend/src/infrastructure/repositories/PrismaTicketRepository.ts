import { Prisma } from '../prisma-client/client';
import client from '../prisma/client';
import { Ticket } from '../../domain/entities/Ticket';
import {
  AdminTicketFilters,
  PaginatedTickets,
  PaginatedTicketsWithOwner,
  TicketFilters,
  TicketRepository,
} from '../../domain/repositories/TicketRepository';

type PrismaTicket = Prisma.TicketModel;

const toTicket = (t: PrismaTicket): Ticket => ({
  id: t.id,
  userId: t.userId,
  title: t.title,
  gameType: t.gameType as Ticket['gameType'],
  gameNumber: t.gameNumber,
  gameDate: t.gameDate,
  amount: t.amount === null ? null : Number(t.amount),
  place: t.place,
  status: t.status as Ticket['status'],
  notes: t.notes,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

export class PrismaTicketRepository implements TicketRepository {
  async create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    const created = await client.ticket.create({
      data: {
        userId: ticket.userId,
        title: ticket.title,
        gameType: ticket.gameType,
        gameNumber: ticket.gameNumber,
        gameDate: ticket.gameDate,
        amount: ticket.amount,
        place: ticket.place,
        status: ticket.status,
        notes: ticket.notes,
      },
    });
    return toTicket(created);
  }

  async findAllByUser(userId: string, filters: TicketFilters): Promise<PaginatedTickets> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));

    const where: Prisma.TicketWhereInput = { userId };
    if (filters.status) where.status = filters.status;
    if (filters.gameType) where.gameType = filters.gameType;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { gameNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      client.ticket.findMany({
        where,
        orderBy: { gameDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      client.ticket.count({ where }),
    ]);

    return {
      items: items.map(toTicket),
      total,
      page,
      pageSize,
    };
  }

  async findAll(filters: AdminTicketFilters): Promise<PaginatedTicketsWithOwner> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));

    const where: Prisma.TicketWhereInput = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.gameType) where.gameType = filters.gameType;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { gameNumber: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      client.ticket.findMany({
        where,
        orderBy: { gameDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      client.ticket.count({ where }),
    ]);

    return {
      items: items.map((t) => ({
        ...toTicket(t),
        owner: { id: t.user.id, name: t.user.name, email: t.user.email },
      })),
      total,
      page,
      pageSize,
    };
  }

  async findById(ticketId: string, userId: string): Promise<Ticket | null> {
    const ticket = await client.ticket.findFirst({
      where: { id: ticketId, userId },
    });
    return ticket ? toTicket(ticket) : null;
  }

  async update(
    ticketId: string,
    userId: string,
    updates: Partial<Omit<Ticket, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
    isAdmin?: boolean
  ): Promise<Ticket | null> {
    const whereClause: Prisma.TicketWhereInput = isAdmin
      ? { id: ticketId }
      : { id: ticketId, userId };

    const existing = await client.ticket.findFirst({
      where: whereClause,
      select: { id: true },
    });
    if (!existing) return null;

    const updated = await client.ticket.update({
      where: { id: ticketId },
      data: {
        title: updates.title,
        gameType: updates.gameType,
        gameNumber: updates.gameNumber,
        gameDate: updates.gameDate,
        amount: updates.amount,
        place: updates.place,
        status: updates.status,
        notes: updates.notes,
      },
    });
    return toTicket(updated);
  }

  async delete(ticketId: string, userId: string): Promise<boolean> {
    const result = await client.ticket.deleteMany({
      where: { id: ticketId, userId },
    });
    return result.count > 0;
  }
}
