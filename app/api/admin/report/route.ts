// /app/api/admin/report/route.js
import connectDB from '@/config/db';
import PostReport from "@/models/PostReport";
import { verifyToken, isAdmin } from "@/utils/auth";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  const payload = verifyToken(token);

  if (!isAdmin(payload)) return new Response("Unauthorized", { status: 403 });

  const reports = await PostReport.find().sort({ createdAt: -1 });
  return Response.json(reports);
}
