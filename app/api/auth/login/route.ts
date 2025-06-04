import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/utils/auth'
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  try {
    const user = await User.findOne({ email });
    console.log("login user from db:", user); // เพิ่มบรรทัดนี้
    if (!user) {
      return NextResponse.json({ message: 'Email not found' }, { status: 401 });
    }

    // Check if user is banned
    if (user.status === "banned") {
      const now = new Date();
      const banUntil = new Date(user.banUntil);
      
      if (banUntil > now) {
        // Still banned
        const daysLeft = Math.ceil((banUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 365) {
          return NextResponse.json({ message: 'บัญชีของคุณถูกแบนถาวร' }, { status: 403 });
        } else {
          return NextResponse.json({ message: `บัญชีของคุณถูกแบนเป็นเวลา ${daysLeft} วัน` }, { status: 403 });
        }
      } else {
        // Ban period is over, update user status
        user.status = "active";
        user.banUntil = null;
        await user.save();
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
    }

    // ตรวจสอบ role ว่าเป็น admin หรือ user
    if (user.role !== "admin" && user.role !== "user") {
      return NextResponse.json({ message: 'Unauthorized role' }, { status: 403 });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );
    console.log("login token payload:", { id: user._id.toString(), role: user.role }); // เพิ่มบรรทัดนี้
    console.log("LOGIN: token created =", token);

    const response = NextResponse.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
  }
}
