import connectDB from "@/utils/connectDB";
import Report from "@/models/Report";
import { verifyToken, isAdmin } from "@/utils/auth";

export async function GET(req, { params }) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  const payload = verifyToken(token);
  if (!isAdmin(payload)) return new Response("Unauthorized", { status: 403 });

  const report = await Report.findById(params.id);
  if (!report) return new Response("Report not found", { status: 404 });

  return Response.json(report);
}

export async function PUT(req, { params }) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  const payload = verifyToken(token);
  if (!isAdmin(payload)) return new Response("Unauthorized", { status: 403 });

  const updateData = await req.json();
  const updated = await Report.findByIdAndUpdate(params.id, updateData, {
    new: true,
  });

  if (!updated) return new Response("Report not found", { status: 404 });

  return Response.json(updated);
}

export async function DELETE(req, { params }) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  const payload = verifyToken(token);
  if (!isAdmin(payload)) return new Response("Unauthorized", { status: 403 });

  const deleted = await Report.findByIdAndDelete(params.id);
  if (!deleted) return new Response("Report not found", { status: 404 });

  return new Response("Report deleted", { status: 200 });
}
