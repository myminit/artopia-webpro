// models/CommunityPost.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface IReport {
  _id: string;
  userId: string;
  reason: string;
  detail?: string;
  createdAt: Date;
}

export interface ICommunityPost extends Document {
  userId: string;
  userName: string;
  imageUrl: string;
  caption: string;
  likes: string[];
  comments: IComment[];
  reports: IReport[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  _id:       { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId:    String,
  userName:  String,
  text:      String,
  createdAt: { type: Date, default: Date.now },
});

const ReportSchema = new Schema<IReport>({
  _id:       { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId:    String,
  reason:    String,
  detail:    String,
  createdAt: { type: Date, default: Date.now },
});

const CommunityPostSchema = new Schema<ICommunityPost>({
  userId:    { type: String, required: true },
  userName:  { type: String, required: true },
  imageUrl:  { type: String, required: true },
  caption:   { type: String, required: true },
  likes:     { type: [String], default: [] },
  comments:  { type: [CommentSchema], default: [] },
  reports:   { type: [ReportSchema], default: [] },
}, { timestamps: true });

const CommunityPost: Model<ICommunityPost> =
  mongoose.models.CommunityPost ||
  mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);

export default CommunityPost;
