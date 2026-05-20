import { Router } from 'express';
import { getAllTickets } from '../../controllers/adminController';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/tickets', getAllTickets);

export default router;
