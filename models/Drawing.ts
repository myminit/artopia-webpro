// /models/Drawing.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDrawing extends Document {
  userId:       mongoose.Types.ObjectId;
  imageUrl:     string;
  thumbnailUrl: string;
  name:         string;
  createdAt:    Date;
  updatedAt:    Date;
}

const DrawingSchema = new Schema<IDrawing>(
  {
    userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl:     { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    name:         { type: String, required: true, default: 'untitled' },
  },
  {
    timestamps: true, // สร้าง createdAt + updatedAt ให้เอง
  }
);

export const Drawing: Model<IDrawing> =
  mongoose.models.Drawing || mongoose.model<IDrawing>('Drawing', DrawingSchema);
