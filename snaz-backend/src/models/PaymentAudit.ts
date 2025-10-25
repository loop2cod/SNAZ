import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentAuditEntry {
  billId: mongoose.Types.ObjectId;
  billNumber: string;
  allocatedAmount: number;
  previousBillBalance: number;
  newBillBalance: number;
  billStatus: 'unpaid' | 'partial' | 'paid' | 'cancelled';
}

export interface IPaymentAudit extends Document {
  paymentId: mongoose.Types.ObjectId;
  entityType: 'customer' | 'company';
  entityId: mongoose.Types.ObjectId;
  paymentAmount: number;
  paymentMethod: string;
  paymentDate: Date;
  allocations: IPaymentAuditEntry[];
  processedBy?: string; // User who processed the payment
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentAuditEntrySchema: Schema = new Schema({
  billId: { type: Schema.Types.ObjectId, ref: 'Bill', required: true },
  billNumber: { type: String, required: true },
  allocatedAmount: { type: Number, required: true, min: 0 },
  previousBillBalance: { type: Number, required: true, min: 0 },
  newBillBalance: { type: Number, required: true, min: 0 },
  billStatus: { type: String, enum: ['unpaid', 'partial', 'paid', 'cancelled'], required: true },
});

const PaymentAuditSchema: Schema = new Schema({
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
  entityType: { type: String, enum: ['customer', 'company'], required: true, index: true },
  entityId: { type: Schema.Types.ObjectId, required: true, index: true },
  paymentAmount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true },
  paymentDate: { type: Date, required: true },
  allocations: [PaymentAuditEntrySchema],
  processedBy: { type: String, trim: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

// Indexes for efficient queries
PaymentAuditSchema.index({ entityType: 1, entityId: 1, paymentDate: -1 });
PaymentAuditSchema.index({ 'allocations.billId': 1 });

export default mongoose.model<IPaymentAudit>('PaymentAudit', PaymentAuditSchema);