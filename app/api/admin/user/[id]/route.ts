// /app/api/admin/user/[id]/route.js
import { NextRequest } from "next/server";
import connectDB from '@/config/db';
import User from "@/models/User";
import { verifyToken, isAdmin } from "@/utils/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value || "";
    const payload = verifyToken(token);
    if (!isAdmin(payload)) {
      return new Response("Unauthorized", { status: 403 });
    }

    const userId = req.url.split("/").pop();
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value || "";
    const payload = verifyToken(token);
    if (!isAdmin(payload)) {
      return new Response("Unauthorized", { status: 403 });
    }

    const userId = req.url.split("/").pop();
    const { action, banUntil } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    switch (action) {
      case "ban":
        user.status = "banned";
        user.banUntil = banUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default
        break;
      case "unban":
        user.status = "active";
        user.banUntil = null;
        break;
      default:
        return new Response("Invalid action", { status: 400 });
    }

    await user.save();
    return Response.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value || "";
    const payload = verifyToken(token);
    if (!isAdmin(payload)) {
      return new Response("Unauthorized", { status: 403 });
    }

    const userId = req.url.split("/").pop();
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return new Response("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}