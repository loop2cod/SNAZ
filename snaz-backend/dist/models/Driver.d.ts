import mongoose, { Document } from 'mongoose';
export interface IDriver extends Document {
    name: string;
    phone?: string;
    email?: string;
    route: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDriver, {}, {}, {}, mongoose.Document<unknown, {}, IDriver, {}, {}> & IDriver & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
