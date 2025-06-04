import mongoose, { Schema, model, models, Document, Types, Model } from 'mongoose';

export interface IPostReport extends Document {
  byUserId: Types.ObjectId;
  reportUserId: Types.ObjectId;
  reason: string;
  detail: string;
  contentId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PostReportSchema = new Schema<IPostReport>(
  {
    byUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    detail: { type: String, default: '' },
    contentId: { type: Schema.Types.ObjectId, required: true }
  },
  { timestamps: true }
);

const PostReport: Model<IPostReport> = models.PostReport || model<IPostReport>("PostReport", PostReportSchema);

export default PostReport; 