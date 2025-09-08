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
const analyticsController = __importStar(require("../controllers/analyticsController"));
const router = express_1.default.Router();
// Validation rules
const validateDailyAnalytics = [
    (0, express_validator_1.query)('date').isISO8601().withMessage('Valid date is required')
];
const validateRangeAnalytics = [
    (0, express_validator_1.query)('startDate').isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.query)('endDate').isISO8601().withMessage('Valid end date is required')
];
const validateCustomerMonthly = [
    (0, express_validator_1.query)('startDate').isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.query)('endDate').isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.query)('taxRate').optional().isFloat({ min: 0, max: 1 }).withMessage('Tax rate must be between 0 and 1')
];
const validateProfitAnalysis = [
    (0, express_validator_1.query)('startDate').isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.query)('endDate').isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.query)('costPerMeal').optional().isFloat({ min: 0 }).withMessage('Cost per meal must be a positive number')
];
const validateBagFormat = [
    (0, express_validator_1.body)('bagFormat').trim().isLength({ min: 1 }).withMessage('Bag format is required')
];
// Routes
router.get('/daily', validateDailyAnalytics, analyticsController.getDailyAnalytics);
router.get('/range', validateRangeAnalytics, analyticsController.getRangeAnalytics);
router.get('/customer/:customerId/monthly', validateCustomerMonthly, analyticsController.getCustomerMonthlyReport);
router.get('/profit', validateProfitAnalysis, analyticsController.getProfitAnalysis);
router.post('/validate-bag-format', validateBagFormat, analyticsController.validateBagFormat);
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map