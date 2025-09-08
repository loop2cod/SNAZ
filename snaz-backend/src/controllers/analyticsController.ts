import { Request, Response } from 'express';
import { CalculationEngine } from '../utils/calculationEngine';
import { validationResult } from 'express-validator';

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