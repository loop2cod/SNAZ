import { Request, Response } from 'express';
export declare const getDailyOrders: (req: Request, res: Response) => Promise<void>;
export declare const getDailyOrderById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateDailyOrders: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDailyOrderItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDailyOrderStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getOrderSummary: (req: Request, res: Response) => Promise<void>;
