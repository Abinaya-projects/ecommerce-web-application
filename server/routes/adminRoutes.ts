import { Router } from 'express';
import {
  getUsers,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} from '../controllers/adminController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
