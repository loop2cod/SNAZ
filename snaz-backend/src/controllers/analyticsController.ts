import { Request, Response } from 'express';
import { CalculationEngine } from '../utils/calculationEngine';
import { validationResult } from 'express-validator';
import { DailyOrder, Customer, Driver, FoodCategory, User } from '../models';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    const startOfYesterday = new Date(yesterday);
    startOfYesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // Get today's orders
    const todaysOrders = await DailyOrder.find({
      date: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }).populate('driverId');

    // Get yesterday's orders for comparison
    const yesterdaysOrders = await DailyOrder.find({
      date: {
        $gte: startOfYesterday,
        $lte: endOfYesterday
      }
    });

    // Calculate today's totals
    const todaysTotalOrders = todaysOrders.length;
    const todaysTotalFood = todaysOrders.reduce((sum, order) => sum + order.totalFood, 0);
    const todaysTotalAmount = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todaysVegFood = todaysOrders.reduce((sum, order) => sum + order.totalVegFood, 0);
    const todaysNonVegFood = todaysOrders.reduce((sum, order) => sum + order.totalNonVegFood, 0);

    // Calculate yesterday's totals for comparison
    const yesterdaysTotalOrders = yesterdaysOrders.length;
    const yesterdaysTotalFood = yesterdaysOrders.reduce((sum, order) => sum + order.totalFood, 0);
    const yesterdaysTotalAmount = yesterdaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get active customers count
    const activeCustomers = await Customer.countDocuments({ isActive: true });
    
    // Get total food categories
    const totalCategories = await FoodCategory.countDocuments({ isActive: true });
    
    // Get active drivers
    const activeDrivers = await Driver.find({ isActive: true });
    
    // Recent activity (last 10 orders)
    const recentOrders = await DailyOrder.find()
      .populate('driverId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Driver status
    const driverStatus = activeDrivers.map(driver => ({
      id: driver._id,
      name: driver.name,
      status: 'Available', // Default status, could be enhanced with real-time tracking
      route: driver.route
    }));

    // Calculate performance metrics
    const completedOrdersCount = todaysOrders.filter(order => order.status === 'completed').length;
    const completionRate = todaysTotalOrders > 0 ? (completedOrdersCount / todaysTotalOrders) * 100 : 0;
    
    const dashboardData = {
      todaysStats: {
        totalOrders: todaysTotalOrders,
        totalFood: todaysTotalFood,
        totalAmount: todaysTotalAmount,
        vegFood: todaysVegFood,
        nonVegFood: todaysNonVegFood,
        activeCustomers,
        activeDrivers: activeDrivers.length,
        totalCategories
      },
      comparisons: {
        ordersChange: todaysTotalOrders - yesterdaysTotalOrders,
        foodChange: todaysTotalFood - yesterdaysTotalFood,
        amountChange: todaysTotalAmount - yesterdaysTotalAmount
      },
      recentActivity: recentOrders.map(order => ({
        id: order._id,
        driverName: (order.driverId as any)?.name || 'Unknown',
        totalFood: order.totalFood,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      })),
      driverStatus,
      performance: {
        completionRate: Math.round(completionRate),
        onTimeDelivery: 95, // Mock data - could be calculated from actual delivery times
        customerSatisfaction: 4.8 // Mock data - could come from ratings system
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDailyAnalytics = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { date } = req.query;
    const analysisDate = new Date(date as string);

    const dailyTotals = await CalculationEngine.calculateDailyTotals(analysisDate);

    if (!dailyTotals) {
      return res.status(404).json({ 
        success: false, 
        message: 'No data found for the specified date' 
      });
    }

    res.json({ success: true, data: dailyTotals });
  } catch (error) {
    console.error('Error getting daily analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRangeAnalytics = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate } = req.query;
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const rangeTotals = await CalculationEngine.calculateRangeTotals(start, end);

    if (!rangeTotals) {
      return res.status(404).json({ 
        success: false, 
        message: 'No data found for the specified date range' 
      });
    }

    res.json({ success: true, data: rangeTotals });
  } catch (error) {
    console.error('Error getting range analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCustomerMonthlyReport = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { customerId } = req.params;
    const { startDate, endDate, taxRate } = req.query;

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const tax = taxRate ? parseFloat(taxRate as string) : 0.18;

    const monthlyReport = await CalculationEngine.calculateCustomerMonthly(
      customerId,
      start,
      end,
      tax
    );

    if (!monthlyReport) {
      return res.status(404).json({ 
        success: false, 
        message: 'Unable to generate monthly report for customer' 
      });
    }

    res.json({ success: true, data: monthlyReport });
  } catch (error) {
    console.error('Error getting customer monthly report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProfitAnalysis = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, costPerMeal } = req.query;
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const cost = costPerMeal ? parseFloat(costPerMeal as string) : 25;

    const profitAnalysis = await CalculationEngine.calculateProfitAnalysis(start, end, cost);

    if (!profitAnalysis) {
      return res.status(404).json({ 
        success: false, 
        message: 'Unable to generate profit analysis' 
      });
    }

    res.json({ success: true, data: profitAnalysis });
  } catch (error) {
    console.error('Error getting profit analysis:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const validateBagFormat = async (req: Request, res: Response) => {
  try {
    const { bagFormat } = req.body;

    const validation = CalculationEngine.validateAndParseBagFormat(bagFormat);

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
  } catch (error) {
    console.error('Error validating bag format:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};