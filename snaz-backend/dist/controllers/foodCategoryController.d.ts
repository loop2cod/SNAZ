import { Request, Response } from 'express';
export declare const getAllFoodCategories: (req: Request, res: Response) => Promise<void>;
export declare const getFoodCategoryById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createFoodCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateFoodCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteFoodCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
