import { Types } from 'mongoose';
export interface MonthlyCalculation {
    customerId: Types.ObjectId;
    customerName: string;
    driverId: Types.ObjectId;
    driverName: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    packageBreakdown: {
        categoryId: Types.ObjectId;
        categoryName: string;
        unitPrice: number;
        totalQuantity: number;
        totalAmount: number;
    }[];
    totalVegFood: number;
    totalNonVegFood: number;
    totalFood: number;
    subtotal: number;
    tax: number;
    totalAmount: number;
}
export interface DailyCalculation {
    date: Date;
    totalVegFood: number;
    totalNonVegFood: number;
    totalFood: number;
    totalAmount: number;
    driverBreakdown: {
        driverId: Types.ObjectId;
        driverName: string;
        route: string;
        vegCount: number;
        nonVegCount: number;
        totalCount: number;
        totalAmount: number;
    }[];
}
export declare class CalculationEngine {
    /**
     * Calculate monthly totals for a specific customer
     */
    static calculateCustomerMonthly(customerId: string, startDate: Date, endDate: Date, taxRate?: number): Promise<MonthlyCalculation | null>;
    /**
     * Calculate daily totals across all orders
     */
    static calculateDailyTotals(date: Date): Promise<DailyCalculation | null>;
    /**
     * Calculate totals for a date range
     */
    static calculateRangeTotals(startDate: Date, endDate: Date): Promise<{
        summary: any;
        driverSummary: any[];
    } | null>;
    /**
     * Calculate profit/loss analysis
     */
    static calculateProfitAnalysis(startDate: Date, endDate: Date, estimatedCostPerMeal?: number): Promise<{
        totalRevenue: any;
        totalFood: any;
        estimatedCostPerMeal: number;
        totalCost: number;
        grossProfit: number;
        profitMargin: number;
    } | null>;
    /**
     * Calculate working days between two dates (excluding weekends)
     */
    private static calculateWorkingDays;
    /**
     * Validate and parse bag format for calculations
     */
    static validateAndParseBagFormat(bagFormat: string): {
        isValid: boolean;
        parsed?: {
            nonVegCount: number;
            vegCount: number;
            totalCount: number;
        };
        error?: string;
    };
}
