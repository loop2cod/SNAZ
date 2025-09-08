import mongoose, { Document } from 'mongoose';
export interface IInvoiceItem {
    customerId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
}
export interface IInvoice extends Document {
    invoiceNumber: string;
    customerId: mongoose.Types.ObjectId;
    driverId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    items: IInvoiceItem[];
    subtotal: number;
    tax: number;
    totalAmount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IInvoice, {}, {}, {}, mongoose.Document<unknown, {}, IInvoice, {}, {}> & IInvoice & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
