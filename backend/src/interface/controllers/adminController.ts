import { Request, Response, NextFunction } from 'express';
import { PrismaTicketRepository } from '../../infrastructure/repositories/PrismaTicketRepository';
import { GetAllTickets } from '../../application/usecases/tickets/GetAllTickets';
import {
  GAME_TYPES,
  GameType,
  TICKET_STATUSES,
  TicketStatus,
} from '../../domain/entities/Ticket';

const ticketRepository = new PrismaTicketRepository();
const getAllTicketsUseCase = new GetAllTickets(ticketRepository);

export const getAllTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, gameType, q, userId, page, pageSize } = req.query;

    if (status && !TICKET_STATUSES.includes(status as TicketStatus)) {
      return res.status(400).json({ error: 'Filtro "status" inválido' });
    }
    if (gameType && !GAME_TYPES.includes(gameType as GameType)) {
      return res.status(400).json({ error: 'Filtro "gameType" inválido' });
    }

    const result = await getAllTicketsUseCase.execute({
      status: status as TicketStatus | undefined,
      gameType: gameType as GameType | undefined,
      search: typeof q === 'string' ? q : undefined,
      userId: typeof userId === 'string' ? userId : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });

    res.status(200).json({
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: Math.ceil(result.total / result.pageSize) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
