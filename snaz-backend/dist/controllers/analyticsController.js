"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBagFormat = exports.getProfitAnalysis = exports.getCustomerMonthlyReport = exports.getRangeAnalytics = exports.getDailyAnalytics = void 0;
const calculationEngine_1 = require("../utils/calculationEngine");
const express_validator_1 = require("express-validator");
const getDailyAnalytics = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { date } = req.query;
        const analysisDate = new Date(date);
        const dailyTotals = await calculationEngine_1.CalculationEngine.calculateDailyTotals(analysisDate);
        if (!dailyTotals) {
            return res.status(404).json({
                success: false,
                message: 'No data found for the specified date'
            });
        }
        res.json({ success: true, data: dailyTotals });
    }
    catch (error) {
        console.error('Error getting daily analytics:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getDailyAnalytics = getDailyAnalytics;
const getRangeAnalytics = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { startDate, endDate } = req.query;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const rangeTotals = await calculationEngine_1.CalculationEngine.calculateRangeTotals(start, end);
        if (!rangeTotals) {
            return res.status(404).json({
                success: false,
                message: 'No data found for the specified date range'
            });
        }
        res.json({ success: true, data: rangeTotals });
    }
    catch (error) {
        console.error('Error getting range analytics:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRangeAnalytics = getRangeAnalytics;
const getCustomerMonthlyReport = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { customerId } = req.params;
        const { startDate, endDate, taxRate } = req.query;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const tax = taxRate ? parseFloat(taxRate) : 0.18;
        const monthlyReport = await calculationEngine_1.CalculationEngine.calculateCustomerMonthly(customerId, start, end, tax);
        if (!monthlyReport) {
            return res.status(404).json({
                success: false,
                message: 'Unable to generate monthly report for customer'
            });
        }
        res.json({ success: true, data: monthlyReport });
    }
    catch (error) {
        console.error('Error getting customer monthly report:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getCustomerMonthlyReport = getCustomerMonthlyReport;
const getProfitAnalysis = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { startDate, endDate, costPerMeal } = req.query;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const cost = costPerMeal ? parseFloat(costPerMeal) : 25;
        const profitAnalysis = await calculationEngine_1.CalculationEngine.calculateProfitAnalysis(start, end, cost);
        if (!profitAnalysis) {
            return res.status(404).json({
                success: false,
                message: 'Unable to generate profit analysis'
            });
        }
        res.json({ success: true, data: profitAnalysis });
    }
    catch (error) {
        console.error('Error getting profit analysis:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getProfitAnalysis = getProfitAnalysis;
const validateBagFormat = async (req, res) => {
    try {
        const { bagFormat } = req.body;
        const validation = calculationEngine_1.CalculationEngine.validateAndParseBagFormat(bagFormat);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }
        res.json({
            success: true,
            data: {
                bagFormat,
                ...validation.parsed
            }
        });
    }
    catch (error) {
        console.error('Error validating bag format:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.validateBagFormat = validateBagFormat;
//# sourceMappingURL=analyticsController.js.map