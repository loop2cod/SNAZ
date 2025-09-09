import { Request, Response } from 'express';
export declare const getAllCustomers: (req: Request, res: Response) => Promise<void>;
export declare const getCustomerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCustomersByDriver: (req: Request, res: Response) => Promise<void>;
export declare const createCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCustomerDailyFood: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const bulkUpdateCustomerDailyFood: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
