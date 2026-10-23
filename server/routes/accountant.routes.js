import express from 'express';
import {
  getClients,
  getClientRecords,
  updateDeductionStatus,
} from '../controllers/accountant.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Accountant', 'Admin'));

router.get('/clients', getClients);
router.get('/clients/:clientId/records', getClientRecords);
router.put('/deductions/:id/status', updateDeductionStatus);

export default router;
