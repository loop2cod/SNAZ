import mongoose, { Document } from 'mongoose';
export interface ICustomerPackage {
    categoryId: mongoose.Types.ObjectId;
    unitPrice: number;
}
export interface IDailyFood {
    lunch: string;
    dinner: string;
}
export interface ICustomer extends Document {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    companyId?: mongoose.Types.ObjectId;
    driverId: mongoose.Types.ObjectId;
    packages: ICustomerPackage[];
    dailyFood: IDailyFood;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICustomer, {}, {}, {}, mongoose.Document<unknown, {}, ICustomer, {}, {}> & ICustomer & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
