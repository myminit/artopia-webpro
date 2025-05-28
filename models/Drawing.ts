// /models/Drawing.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDrawing extends Document {
  userId: mongoose.Types.ObjectId;
  drawingName: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

const DrawingSchema: Schema<IDrawing> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  drawingName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Drawing: Model<IDrawing> =
  mongoose.models.Drawing || mongoose.model<IDrawing>('Drawing', DrawingSchema);
