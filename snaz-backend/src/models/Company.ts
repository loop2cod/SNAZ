import mongoose, { Document, Schema } from 'mongoose';

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

const CompanySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
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
    trim: true,
    lowercase: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Note: name index is automatically created via unique: true
// Index for efficient queries
CompanySchema.index({ isActive: 1 });

export default mongoose.model<ICompany>('Company', CompanySchema);