
import connectDB from '@/config/db';
import User from "@/models/User";
import { verifyToken, isAdmin } from "@/utils/auth";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  const payload = verifyToken(token);

  if (!isAdmin(payload)) {
    return new Response("Unauthorized", { status: 403 });
  }

  const users = await User.find().select("-password");
  return Response.json(users);
}
