import mongoose, { Document } from 'mongoose';
export interface ICompany extends Document {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICompany, {}, {}, {}, mongoose.Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
