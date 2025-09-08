import mongoose, { Document } from 'mongoose';
export interface IFoodCategory extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IFoodCategory, {}, {}, {}, mongoose.Document<unknown, {}, IFoodCategory, {}, {}> & IFoodCategory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
