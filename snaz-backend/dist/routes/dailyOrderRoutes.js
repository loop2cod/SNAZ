"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const dailyOrderController = __importStar(require("../controllers/dailyOrderController"));
const router = express_1.default.Router();
// Validation rules
const validateGenerateOrders = [
    (0, express_validator_1.body)('date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('neaStartTime').isISO8601().withMessage('Valid NEA start time is required')
];
const validateUpdateOrderItem = [
    (0, express_validator_1.body)('bagFormat').trim().isLength({ min: 1 }).withMessage('Bag format is required')
];
const validateUpdateStatus = [
    (0, express_validator_1.body)('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Valid status is required')
];
const validateDateQuery = [
    (0, express_validator_1.query)('date').optional().isISO8601().withMessage('Valid date format is required'),
    (0, express_validator_1.query)('driverId').optional().isMongoId().withMessage('Valid driver ID is required')
];
const validateSummaryQuery = [
    (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('Valid end date is required')
];
// Routes
router.get('/', validateDateQuery, dailyOrderController.getDailyOrders);
router.get('/summary', validateSummaryQuery, dailyOrderController.getOrderSummary);
router.get('/:id', dailyOrderController.getDailyOrderById);
router.post('/generate', validateGenerateOrders, dailyOrderController.generateDailyOrders);
router.put('/:orderId/items/:orderItemId', validateUpdateOrderItem, dailyOrderController.updateDailyOrderItem);
router.patch('/:id/status', validateUpdateStatus, dailyOrderController.updateDailyOrderStatus);
exports.default = router;
//# sourceMappingURL=dailyOrderRoutes.js.map