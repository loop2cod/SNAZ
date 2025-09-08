import mongoose, { Document } from 'mongoose';
export interface IOrderItem {
    customerId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
    mealType: 'lunch' | 'dinner';
    bagFormat: string;
    nonVegCount: number;
    vegCount: number;
    totalCount: number;
    unitPrice: number;
    totalAmount: number;
}
export interface IDailyOrder extends Document {
    date: Date;
    driverId: mongoose.Types.ObjectId;
    orders: IOrderItem[];
    totalVegFood: number;
    totalNonVegFood: number;
    totalFood: number;
    totalAmount: number;
    neaStartTime: Date;
    neaEndTime: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDailyOrder, {}, {}, {}, mongoose.Document<unknown, {}, IDailyOrder, {}, {}> & IDailyOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
