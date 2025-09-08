import { Request, Response } from 'express';
export declare const getDailyAnalytics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getRangeAnalytics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCustomerMonthlyReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProfitAnalysis: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateBagFormat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
