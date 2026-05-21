import { Request, Response, NextFunction } from 'express';
import { PrismaTicketRepository } from '../../infrastructure/repositories/PrismaTicketRepository';
import { CreateTicket } from '../../application/usecases/tickets/CreateTicket';
import { GetTickets } from '../../application/usecases/tickets/GetTickets';
import { GetTicketById } from '../../application/usecases/tickets/GetTicketById';
import { UpdateTicket } from '../../application/usecases/tickets/UpdateTicket';
import { DeleteTicket } from '../../application/usecases/tickets/DeleteTicket';
import {
  GAME_TYPES,
  GameType,
  TICKET_STATUSES,
  TicketStatus,
} from '../../domain/entities/Ticket';
import { CreateTicketDto } from '../../infrastructure/validators/tickets/CreateTicketDto';
import { UpdateTicketDto } from '../../infrastructure/validators/tickets/UpdateTicketDto';

const ticketRepository = new PrismaTicketRepository();
const createTicketUseCase = new CreateTicket(ticketRepository);
const getTicketsUseCase = new GetTickets(ticketRepository);
const getTicketByIdUseCase = new GetTicketById(ticketRepository);
const updateTicketUseCase = new UpdateTicket(ticketRepository);
const deleteTicketUseCase = new DeleteTicket(ticketRepository);

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const dto = req.body as CreateTicketDto;
    const ticket = await createTicketUseCase.execute({
      userId,
      title: dto.title,
      gameType: dto.gameType,
      gameNumber: dto.gameNumber ?? null,
      gameDate: dto.gameDate,
      amount: dto.amount ?? null,
      place: dto.place ?? null,
      status: dto.status,
      notes: dto.notes ?? null,
    });
    res.status(201).json({ data: ticket });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { status, gameType, q, page, pageSize } = req.query;

    if (status && !TICKET_STATUSES.includes(status as TicketStatus)) {
      return res.status(400).json({ error: 'Filtro "status" inválido' });
    }
    if (gameType && !GAME_TYPES.includes(gameType as GameType)) {
      return res.status(400).json({ error: 'Filtro "gameType" inválido' });
    }

    const result = await getTicketsUseCase.execute(userId, {
      status: status as TicketStatus | undefined,
      gameType: gameType as GameType | undefined,
      search: typeof q === 'string' ? q : undefined,
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

export const getTicketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const ticket = await getTicketByIdUseCase.execute(req.params.id, userId);
    res.status(200).json({ data: ticket });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const dto = req.body as UpdateTicketDto;
    const isAdmin = req.userRole === 'admin';
    const updated = await updateTicketUseCase.execute(req.params.id, userId, dto, isAdmin);
    res.status(200).json({ data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const ticketId = req.params.id;
    await deleteTicketUseCase.execute(ticketId, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
