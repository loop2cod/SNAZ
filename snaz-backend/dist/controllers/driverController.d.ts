import { Request, Response } from 'express';
export declare const getAllDrivers: (req: Request, res: Response) => Promise<void>;
export declare const getDriverById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createDriver: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDriver: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteDriver: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
