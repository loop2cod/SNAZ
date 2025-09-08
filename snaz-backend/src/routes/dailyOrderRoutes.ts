import express from 'express';
import { body, query } from 'express-validator';
import * as dailyOrderController from '../controllers/dailyOrderController';

const router = express.Router();

// Validation rules
const validateGenerateOrders = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('neaStartTime').isISO8601().withMessage('Valid NEA start time is required')
];

const validateUpdateOrderItem = [
  body('bagFormat').trim().isLength({ min: 1 }).withMessage('Bag format is required')
];

const validateUpdateStatus = [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Valid status is required')
];

const validateDateQuery = [
  query('date').optional().isISO8601().withMessage('Valid date format is required'),
  query('driverId').optional().isMongoId().withMessage('Valid driver ID is required')
];

const validateSummaryQuery = [
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required')
];

// Routes
router.get('/', validateDateQuery, dailyOrderController.getDailyOrders);
router.get('/summary', validateSummaryQuery, dailyOrderController.getOrderSummary);
router.get('/:id', dailyOrderController.getDailyOrderById);
router.post('/generate', validateGenerateOrders, dailyOrderController.generateDailyOrders);
router.put('/:orderId/items/:orderItemId', validateUpdateOrderItem, dailyOrderController.updateDailyOrderItem);
router.patch('/:id/status', validateUpdateStatus, dailyOrderController.updateDailyOrderStatus);

export default router;