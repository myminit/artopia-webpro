//สำหรับuserที่กดreport
// /app/api/report/route.js
/*import connectDB from '@/config/db';
import Report from "@/models/Reportuser";
import { verifyToken } from "@/utils/auth";

export async function POST(req) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  const payload = verifyToken(token);
  if (!payload) return new Response("Unauthorized", { status: 401 });

  const { reportUserId, reason, detail } = await req.json();

  if (!reportUserId || !reason) {
    return new Response("Missing required fields", { status: 400 });
  }

  const newReport = new Report({
    byUserId: payload.id,
    reportUserId,
    reason,
    detail: detail || "",
  });

  await newReport.save();

  return Response.json({ message: "Report submitted successfully" });
}*/
