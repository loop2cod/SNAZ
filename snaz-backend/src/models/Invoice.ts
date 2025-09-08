import mongoose, { Document, Schema } from 'mongoose';

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

const InvoiceItemSchema: Schema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'FoodCategory',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
});

const InvoiceSchema: Schema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  items: [InvoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true
});

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);