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
const customerController = __importStar(require("../controllers/customerController"));
const router = express_1.default.Router();
// Validation rules
const validateCustomer = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and should be 1-100 characters'),
    (0, express_validator_1.body)('address').trim().isLength({ min: 1, max: 300 }).withMessage('Address is required and should be 1-300 characters'),
    (0, express_validator_1.body)('phone').optional().trim().isLength({ max: 15 }).withMessage('Phone should be max 15 characters'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('driverId').isMongoId().withMessage('Valid driver ID is required'),
    (0, express_validator_1.body)('packages').isArray({ min: 1 }).withMessage('At least one package is required'),
    (0, express_validator_1.body)('packages.*.categoryId').isMongoId().withMessage('Valid category ID is required'),
    (0, express_validator_1.body)('packages.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
    (0, express_validator_1.body)('dailyFood.lunch').trim().isLength({ min: 1 }).withMessage('Daily lunch is required'),
    (0, express_validator_1.body)('dailyFood.dinner').trim().isLength({ min: 1 }).withMessage('Daily dinner is required'),
    (0, express_validator_1.body)('startDate').isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.body)('endDate').optional().isISO8601().withMessage('Valid end date is required')
];
// Routes
router.get('/', customerController.getAllCustomers);
router.get('/driver/:driverId', customerController.getCustomersByDriver);
router.get('/:id', customerController.getCustomerById);
router.post('/', validateCustomer, customerController.createCustomer);
router.put('/:id', validateCustomer, customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
// Daily food updates
const validateDailyFoodPatch = [
    (0, express_validator_1.body)('lunch').optional().isString().withMessage('Lunch must be a string'),
    (0, express_validator_1.body)('dinner').optional().isString().withMessage('Dinner must be a string'),
];
const validateBulkDailyFood = [
    (0, express_validator_1.body)('updates').isArray({ min: 1 }).withMessage('Updates array is required'),
    (0, express_validator_1.body)('updates.*.customerId').isMongoId().withMessage('Valid customer ID is required'),
    (0, express_validator_1.body)('updates.*.mealType').isIn(['lunch', 'dinner']).withMessage('mealType must be lunch or dinner'),
    (0, express_validator_1.body)('updates.*.bagFormat').isString().withMessage('bagFormat must be a string'),
];
router.patch('/:id/daily-food', validateDailyFoodPatch, customerController.updateCustomerDailyFood);
router.patch('/bulk-update-daily-food', validateBulkDailyFood, customerController.bulkUpdateCustomerDailyFood);
exports.default = router;
//# sourceMappingURL=customerRoutes.js.map