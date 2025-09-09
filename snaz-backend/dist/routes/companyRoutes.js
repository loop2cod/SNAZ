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
const companyController = __importStar(require("../controllers/companyController"));
const router = express_1.default.Router();
// Validation rules
const validateCompany = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and should be 1-100 characters'),
    (0, express_validator_1.body)('address').trim().isLength({ min: 1, max: 300 }).withMessage('Address is required and should be 1-300 characters'),
    (0, express_validator_1.body)('phone').optional().trim().isLength({ max: 15 }).withMessage('Phone should be max 15 characters'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('contactPerson').optional().trim().isLength({ max: 100 }).withMessage('Contact person should be max 100 characters'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];
const validateCompanyUpdate = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and should be 1-100 characters'),
    (0, express_validator_1.body)('address').trim().isLength({ min: 1, max: 300 }).withMessage('Address is required and should be 1-300 characters'),
    (0, express_validator_1.body)('phone').optional().trim().isLength({ max: 15 }).withMessage('Phone should be max 15 characters'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('contactPerson').optional().trim().isLength({ max: 100 }).withMessage('Contact person should be max 100 characters'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];
// Routes
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.get('/:id/customers', companyController.getCompanyCustomers);
router.post('/', validateCompany, companyController.createCompany);
router.put('/:id', validateCompanyUpdate, companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);
exports.default = router;
//# sourceMappingURL=companyRoutes.js.map