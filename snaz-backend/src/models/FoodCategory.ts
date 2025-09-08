import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodCategory extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FoodCategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
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

export default mongoose.model<IFoodCategory>('FoodCategory', FoodCategorySchema);