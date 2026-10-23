import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemStats,
  getTaxSlabs,
  createTaxSlab,
  updateTaxSlab,
  deleteTaxSlab,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.route('/tax-slabs').get(getTaxSlabs).post(createTaxSlab);
router.route('/tax-slabs/:id').put(updateTaxSlab).delete(deleteTaxSlab);

export default router;
