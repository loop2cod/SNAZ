"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculationEngine = void 0;
const mongoose_1 = require("mongoose");
const bagFormatParser_1 = require("./bagFormatParser");
const DailyOrder_1 = __importDefault(require("../models/DailyOrder"));
const Customer_1 = __importDefault(require("../models/Customer"));
class CalculationEngine {
    /**
     * Calculate monthly totals for a specific customer
     */
    static async calculateCustomerMonthly(customerId, startDate, endDate, taxRate = 0.18) {
        try {
            const customer = await Customer_1.default.findById(customerId)
                .populate('driverId', 'name route')
                .populate('packages.categoryId', 'name');
            if (!customer) {
                throw new Error('Customer not found');
            }
            // Get all daily orders for this customer in the date range
            const dailyOrders = await DailyOrder_1.default.find({
                date: { $gte: startDate, $lte: endDate },
                'orders.customerId': new mongoose_1.Types.ObjectId(customerId)
            }).populate('orders.categoryId', 'name');
            // Calculate working days between start and end date
            const totalDays = this.calculateWorkingDays(startDate, endDate);
            let totalVegFood = 0;
            let totalNonVegFood = 0;
            let subtotal = 0;
            const packageBreakdown = [];
            // Process each package category
            customer.packages.forEach(pkg => {
                const categoryOrders = dailyOrders.flatMap(order => order.orders.filter(item => item.customerId.toString() === customerId &&
                    item.categoryId._id.toString() === pkg.categoryId._id.toString()));
                const totalQuantity = categoryOrders.reduce((sum, order) => sum + order.totalCount, 0);
                const totalAmount = categoryOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                packageBreakdown.push({
                    categoryId: pkg.categoryId._id,
                    categoryName: pkg.categoryId.name,
                    unitPrice: pkg.unitPrice,
                    totalQuantity,
                    totalAmount
                });
                subtotal += totalAmount;
            });
            // Calculate food totals
            dailyOrders.forEach(order => {
                order.orders.forEach(item => {
                    if (item.customerId.toString() === customerId) {
                        totalVegFood += item.vegCount;
                        totalNonVegFood += item.nonVegCount;
                    }
                });
            });
            const tax = subtotal * taxRate;
            const totalAmount = subtotal + tax;
            return {
                customerId: customer._id,
                customerName: customer.name,
                driverId: customer.driverId._id,
                driverName: customer.driverId.name,
                startDate,
                endDate,
                totalDays,
                packageBreakdown,
                totalVegFood,
                totalNonVegFood,
                totalFood: totalVegFood + totalNonVegFood,
                subtotal,
                tax,
                totalAmount
            };
        }
        catch (error) {
            console.error('Error calculating customer monthly:', error);
            return null;
        }
    }
    /**
     * Calculate daily totals across all orders
     */
    static async calculateDailyTotals(date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            const dailyOrders = await DailyOrder_1.default.find({
                date: { $gte: startOfDay, $lte: endOfDay }
            }).populate('driverId', 'name route');
            let totalVegFood = 0;
            let totalNonVegFood = 0;
            let totalAmount = 0;
            const driverBreakdown = dailyOrders.map(order => {
                totalVegFood += order.totalVegFood;
                totalNonVegFood += order.totalNonVegFood;
                totalAmount += order.totalAmount;
                return {
                    driverId: order.driverId._id,
                    driverName: order.driverId.name,
                    route: order.driverId.route,
                    vegCount: order.totalVegFood,
                    nonVegCount: order.totalNonVegFood,
                    totalCount: order.totalFood,
                    totalAmount: order.totalAmount
                };
            });
            return {
                date,
                totalVegFood,
                totalNonVegFood,
                totalFood: totalVegFood + totalNonVegFood,
                totalAmount,
                driverBreakdown
            };
        }
        catch (error) {
            console.error('Error calculating daily totals:', error);
            return null;
        }
    }
    /**
     * Calculate totals for a date range
     */
    static async calculateRangeTotals(startDate, endDate) {
        try {
            const summary = await DailyOrder_1.default.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalVegFood: { $sum: '$totalVegFood' },
                        totalNonVegFood: { $sum: '$totalNonVegFood' },
                        totalFood: { $sum: '$totalFood' },
                        totalRevenue: { $sum: '$totalAmount' },
                        averageOrderValue: { $avg: '$totalAmount' }
                    }
                }
            ]);
            const driverSummary = await DailyOrder_1.default.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $lookup: {
                        from: 'drivers',
                        localField: 'driverId',
                        foreignField: '_id',
                        as: 'driver'
                    }
                },
                {
                    $unwind: '$driver'
                },
                {
                    $group: {
                        _id: '$driverId',
                        driverName: { $first: '$driver.name' },
                        route: { $first: '$driver.route' },
                        totalOrders: { $sum: 1 },
                        totalVegFood: { $sum: '$totalVegFood' },
                        totalNonVegFood: { $sum: '$totalNonVegFood' },
                        totalFood: { $sum: '$totalFood' },
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                },
                {
                    $sort: { totalRevenue: -1 }
                }
            ]);
            return {
                summary: summary[0] || {
                    totalOrders: 0,
                    totalVegFood: 0,
                    totalNonVegFood: 0,
                    totalFood: 0,
                    totalRevenue: 0,
                    averageOrderValue: 0
                },
                driverSummary
            };
        }
        catch (error) {
            console.error('Error calculating range totals:', error);
            return null;
        }
    }
    /**
     * Calculate profit/loss analysis
     */
    static async calculateProfitAnalysis(startDate, endDate, estimatedCostPerMeal = 25) {
        try {
            const totals = await this.calculateRangeTotals(startDate, endDate);
            if (!totals)
                return null;
            const { summary } = totals;
            const totalCost = summary.totalFood * estimatedCostPerMeal;
            const grossProfit = summary.totalRevenue - totalCost;
            const profitMargin = summary.totalRevenue > 0 ? (grossProfit / summary.totalRevenue) * 100 : 0;
            return {
                totalRevenue: summary.totalRevenue,
                totalFood: summary.totalFood,
                estimatedCostPerMeal,
                totalCost,
                grossProfit,
                profitMargin: Math.round(profitMargin * 100) / 100
            };
        }
        catch (error) {
            console.error('Error calculating profit analysis:', error);
            return null;
        }
    }
    /**
     * Calculate working days between two dates (excluding weekends)
     */
    static calculateWorkingDays(startDate, endDate) {
        let count = 0;
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
                count++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return count;
    }
    /**
     * Validate and parse bag format for calculations
     */
    static validateAndParseBagFormat(bagFormat) {
        try {
            if (!bagFormat || typeof bagFormat !== 'string') {
                return { isValid: false, error: 'Bag format is required and must be a string' };
            }
            const parsed = (0, bagFormatParser_1.parseBagFormat)(bagFormat);
            if (parsed.totalCount === 0) {
                return { isValid: false, error: 'Bag format must contain at least one item' };
            }
            return { isValid: true, parsed };
        }
        catch (error) {
            return { isValid: false, error: 'Invalid bag format' };
        }
    }
}
exports.CalculationEngine = CalculationEngine;
//# sourceMappingURL=calculationEngine.js.map