import mongoose, { Schema, model, models, Document, Types, Model } from 'mongoose';

export interface IReport extends Document {
  byUserId: Types.ObjectId;
  reportUserId: Types.ObjectId;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    byUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

const Report: Model<IReport> = models.Report || model<IReport>("Report", ReportSchema);

export default Report;
