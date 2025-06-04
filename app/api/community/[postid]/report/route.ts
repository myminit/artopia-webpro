// File: app/api/community/[postid]/report/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import CommunityPost from '@/models/CommunityPost';
import PostReport from "@/models/PostReport";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value || "";
    const payload = verifyToken(token);

    const { reason, detail } = await req.json();
    
    // Get postId from URL
    const postId = req.url.split('/').slice(-2)[0];

    if (!reason) {
      return new Response("Missing required fields", { status: 400 });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    // Get user name from database
    const user = await User.findById(payload.id);
    const userName = user?.name || "Unknown User";

    // Create report document
    const report = new PostReport({
      byUserId: new mongoose.Types.ObjectId(payload.id),
      reportUserId: new mongoose.Types.ObjectId(post.userId),
      reason,
      detail: detail || "",
      contentId: new mongoose.Types.ObjectId(postId)
    });

    await report.save();

    // Add report to post
    post.reports.push({
      _id: report._id,
      userId: payload.id,
      userName: userName,
      reason,
      detail: detail || "",
      createdAt: new Date()
    });
    await post.save();

    return new Response(JSON.stringify({
      _id: report._id,
      byUserId: report.byUserId,
      reportUserId: report.reportUserId,
      reason: report.reason,
      detail: report.detail,
      contentId: report.contentId,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Error creating report:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
