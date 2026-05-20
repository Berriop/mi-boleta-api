import { Router } from 'express';
import {
  createTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  updateTicket,
} from '../../controllers/ticketsController';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateDto } from '../../middlewares/validateDto';
import { CreateTicketDto } from '../../../infrastructure/validators/tickets/CreateTicketDto';
import { UpdateTicketDto } from '../../../infrastructure/validators/tickets/UpdateTicketDto';

const router = Router();

router.use(authenticate);

router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', validateDto(CreateTicketDto), createTicket);
router.put('/:id', validateDto(UpdateTicketDto), updateTicket);
router.delete('/:id', deleteTicket);

export default router;
