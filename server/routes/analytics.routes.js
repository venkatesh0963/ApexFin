import express from 'express';
import {
  getSummary,
  getMonthlyData,
  getCategoriesData,
  getYearlyData,
  getPublicTaxSlabs,
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/monthly', getMonthlyData);
router.get('/categories', getCategoriesData);
router.get('/yearly', getYearlyData);
router.get('/tax-slabs', getPublicTaxSlabs);

export default router;
