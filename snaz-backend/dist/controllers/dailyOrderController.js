"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderSummary = exports.updateDailyOrderStatus = exports.updateDailyOrderItem = exports.generateDailyOrders = exports.getDailyOrderById = exports.getDailyOrders = void 0;
const DailyOrder_1 = __importDefault(require("../models/DailyOrder"));
const Customer_1 = __importDefault(require("../models/Customer"));
const express_validator_1 = require("express-validator");
const bagFormatParser_1 = require("../utils/bagFormatParser");
const getDailyOrders = async (req, res) => {
    try {
        const { date, driverId } = req.query;
        let filter = {};
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }
        if (driverId) {
            filter.driverId = driverId;
        }
        const orders = await DailyOrder_1.default.find(filter)
            .populate('driverId', 'name route')
            .populate('orders.customerId', 'name address')
            .populate('orders.categoryId', 'name')
            .sort({ date: -1 });
        res.json({ success: true, data: orders });
    }
    catch (error) {
        console.error('Error fetching daily orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getDailyOrders = getDailyOrders;
const getDailyOrderById = async (req, res) => {
    try {
        const order = await DailyOrder_1.default.findById(req.params.id)
            .populate('driverId', 'name route')
            .populate('orders.customerId', 'name address')
            .populate('orders.categoryId', 'name');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Daily order not found' });
        }
        res.json({ success: true, data: order });
    }
    catch (error) {
        console.error('Error fetching daily order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getDailyOrderById = getDailyOrderById;
const generateDailyOrders = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { date, neaStartTime } = req.body;
        const orderDate = new Date(date);
        const startTime = new Date(neaStartTime);
        const endTime = (0, bagFormatParser_1.calculateNEAEndTime)(startTime);
        // Check if orders already exist for this date
        const existingOrders = await DailyOrder_1.default.find({
            date: {
                $gte: new Date(orderDate.setHours(0, 0, 0, 0)),
                $lte: new Date(orderDate.setHours(23, 59, 59, 999))
            }
        });
        if (existingOrders.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Daily orders already exist for this date'
            });
        }
        // Get all active customers
        const customers = await Customer_1.default.find({ isActive: true })
            .populate('driverId', 'name route')
            .populate('packages.categoryId', 'name');
        // Group customers by driver
        const customersByDriver = customers.reduce((acc, customer) => {
            const driverId = customer.driverId._id.toString();
            if (!acc[driverId]) {
                acc[driverId] = {
                    driver: customer.driverId,
                    customers: []
                };
            }
            acc[driverId].customers.push(customer);
            return acc;
        }, {});
        const dailyOrders = [];
        // Generate orders for each driver
        for (const [driverId, driverData] of Object.entries(customersByDriver)) {
            const orders = [];
            let totalVegFood = 0;
            let totalNonVegFood = 0;
            let totalAmount = 0;
            // Process each customer
            for (const customer of driverData.customers) {
                // Process lunch and dinner
                for (const mealType of ['lunch', 'dinner']) {
                    const bagFormat = customer.dailyFood[mealType];
                    const parsed = (0, bagFormatParser_1.parseBagFormat)(bagFormat);
                    // Create order items for each package category
                    for (const pkg of customer.packages) {
                        const orderAmount = parsed.totalCount * pkg.unitPrice;
                        orders.push({
                            customerId: customer._id,
                            categoryId: pkg.categoryId._id,
                            mealType,
                            bagFormat,
                            nonVegCount: parsed.nonVegCount,
                            vegCount: parsed.vegCount,
                            totalCount: parsed.totalCount,
                            unitPrice: pkg.unitPrice,
                            totalAmount: orderAmount
                        });
                        totalVegFood += parsed.vegCount;
                        totalNonVegFood += parsed.nonVegCount;
                        totalAmount += orderAmount;
                    }
                }
            }
            const dailyOrder = new DailyOrder_1.default({
                date: orderDate,
                driverId,
                orders,
                totalVegFood,
                totalNonVegFood,
                totalFood: totalVegFood + totalNonVegFood,
                totalAmount,
                neaStartTime: startTime,
                neaEndTime: endTime
            });
            dailyOrders.push(dailyOrder);
        }
        // Save all daily orders
        const savedOrders = await DailyOrder_1.default.insertMany(dailyOrders);
        // Populate the saved orders for response
        const populatedOrders = await DailyOrder_1.default.find({
            _id: { $in: savedOrders.map(order => order._id) }
        })
            .populate('driverId', 'name route')
            .populate('orders.customerId', 'name address')
            .populate('orders.categoryId', 'name');
        res.status(201).json({
            success: true,
            data: populatedOrders,
            message: `Generated ${savedOrders.length} daily order(s) successfully`
        });
    }
    catch (error) {
        console.error('Error generating daily orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.generateDailyOrders = generateDailyOrders;
const updateDailyOrderItem = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { orderId, orderItemId } = req.params;
        const { bagFormat } = req.body;
        const dailyOrder = await DailyOrder_1.default.findById(orderId);
        if (!dailyOrder) {
            return res.status(404).json({ success: false, message: 'Daily order not found' });
        }
        const orderItem = dailyOrder.orders.find(item => item._id?.toString() === orderItemId);
        if (!orderItem) {
            return res.status(404).json({ success: false, message: 'Order item not found' });
        }
        // Parse new bag format
        const parsed = (0, bagFormatParser_1.parseBagFormat)(bagFormat);
        const newTotalAmount = parsed.totalCount * orderItem.unitPrice;
        // Update the order item
        orderItem.bagFormat = bagFormat;
        orderItem.nonVegCount = parsed.nonVegCount;
        orderItem.vegCount = parsed.vegCount;
        orderItem.totalCount = parsed.totalCount;
        orderItem.totalAmount = newTotalAmount;
        // Recalculate totals for the entire daily order
        let totalVegFood = 0;
        let totalNonVegFood = 0;
        let totalAmount = 0;
        dailyOrder.orders.forEach(item => {
            totalVegFood += item.vegCount;
            totalNonVegFood += item.nonVegCount;
            totalAmount += item.totalAmount;
        });
        dailyOrder.totalVegFood = totalVegFood;
        dailyOrder.totalNonVegFood = totalNonVegFood;
        dailyOrder.totalFood = totalVegFood + totalNonVegFood;
        dailyOrder.totalAmount = totalAmount;
        await dailyOrder.save();
        const updatedOrder = await DailyOrder_1.default.findById(orderId)
            .populate('driverId', 'name route')
            .populate('orders.customerId', 'name address')
            .populate('orders.categoryId', 'name');
        res.json({ success: true, data: updatedOrder });
    }
    catch (error) {
        console.error('Error updating daily order item:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateDailyOrderItem = updateDailyOrderItem;
const updateDailyOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        const dailyOrder = await DailyOrder_1.default.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true })
            .populate('driverId', 'name route')
            .populate('orders.customerId', 'name address')
            .populate('orders.categoryId', 'name');
        if (!dailyOrder) {
            return res.status(404).json({ success: false, message: 'Daily order not found' });
        }
        res.json({ success: true, data: dailyOrder });
    }
    catch (error) {
        console.error('Error updating daily order status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateDailyOrderStatus = updateDailyOrderStatus;
const getOrderSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const summary = await DailyOrder_1.default.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalVegFood: { $sum: '$totalVegFood' },
                    totalNonVegFood: { $sum: '$totalNonVegFood' },
                    totalFood: { $sum: '$totalFood' },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);
        const result = summary[0] || {
            totalOrders: 0,
            totalVegFood: 0,
            totalNonVegFood: 0,
            totalFood: 0,
            totalRevenue: 0
        };
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error getting order summary:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getOrderSummary = getOrderSummary;
//# sourceMappingURL=dailyOrderController.js.map