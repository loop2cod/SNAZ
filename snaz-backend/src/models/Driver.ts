import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  phone?: string;
  email?: string;
  route: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema: Schema = new Schema({
  name: {
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
  route: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IDriver>('Driver', DriverSchema);