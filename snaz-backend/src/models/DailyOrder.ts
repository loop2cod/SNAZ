import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  customerId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  mealType: 'lunch' | 'dinner';
  bagFormat: string; // e.g., "5,5+7"
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

const OrderItemSchema: Schema = new Schema({
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
  mealType: {
    type: String,
    enum: ['lunch', 'dinner'],
    required: true
  },
  bagFormat: {
    type: String,
    required: true,
    trim: true
  },
  nonVegCount: {
    type: Number,
    required: true,
    min: 0
  },
  vegCount: {
    type: Number,
    required: true,
    min: 0
  },
  totalCount: {
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

const DailyOrderSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  orders: [OrderItemSchema],
  totalVegFood: {
    type: Number,
    default: 0,
    min: 0
  },
  totalNonVegFood: {
    type: Number,
    default: 0,
    min: 0
  },
  totalFood: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  neaStartTime: {
    type: Date
  },
  neaEndTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient queries
DailyOrderSchema.index({ date: 1, driverId: 1 });

export default mongoose.model<IDailyOrder>('DailyOrder', DailyOrderSchema);