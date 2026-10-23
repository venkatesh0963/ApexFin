import express from 'express';
import {
  getDeductions,
  createDeduction,
  updateDeduction,
  deleteDeduction,
} from '../controllers/deduction.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getDeductions).post(createDeduction);
router.route('/:id').put(updateDeduction).delete(deleteDeduction);

export default router;
