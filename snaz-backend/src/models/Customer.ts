import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomerPackage {
  categoryId: mongoose.Types.ObjectId;
  unitPrice: number;
}

export interface IDailyFood {
  lunch: string; // e.g., "5,5+7" (5 non-veg, 5 non-veg, 7 veg)
  dinner: string;
}

export interface ICustomer extends Document {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  driverId: mongoose.Types.ObjectId;
  packages: ICustomerPackage[];
  dailyFood: IDailyFood;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerPackageSchema: Schema = new Schema({
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'FoodCategory',
    required: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const DailyFoodSchema: Schema = new Schema({
  lunch: {
    type: String,
    required: true,
    trim: true
  },
  dinner: {
    type: String,
    required: true,
    trim: true
  }
});

const CustomerSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  packages: [CustomerPackageSchema],
  dailyFood: {
    type: DailyFoodSchema,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);