// /app/api/admin/user/[id]/route.js
import connectDB from '@/config/db';
import User from "@/models/User";
import { verifyToken, isAdmin } from "@/utils/auth";

export async function PUT(req, { params }) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  const payload = verifyToken(token);
  if (!isAdmin(payload)) return new Response("Unauthorized", { status: 403 });

  const { id } = params;
  const data = await req.json();

  const updated = await User.findByIdAndUpdate(id, data, { new: true });
  return Response.json(updated);
}

export async function DELETE(req, { params }) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  const payload = verifyToken(token);
  if (!isAdmin(payload)) return new Response("Unauthorized", { status: 403 });

  const { id } = params;
  await User.findByIdAndDelete(id);
  return new Response("User deleted", { status: 200 });
}


export async function GET(req, { params }) {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    const payload = verifyToken(token);
    if (!isAdmin(payload)) return new Response("Unauthorized", { status: 403 });
  
    const { id } = params;
    const user = await User.findById(id).select("-password");
    if (!user) return new Response("User not found", { status: 404 });
  
    return Response.json(user);
  }