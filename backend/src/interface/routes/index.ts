import { Router } from 'express';
import authRoutes from './v1/authRoutes';
import ticketRoutes from './v1/ticketRoutes';
import adminRoutes from './v1/adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/admin', adminRoutes);

router.get('/', (_req, res) => {
  res.json({ version: '1.0', message: 'API Boletas v1' });
});

export default router;
