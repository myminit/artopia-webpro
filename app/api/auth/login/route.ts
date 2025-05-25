import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/utills/auth'
export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // บอกชัดว่า email ผิด
      return NextResponse.json({ message: 'Email not found' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // บอกชัดว่ารหัสผิด
      return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
    }

    const token = signToken({ id: user._id.toString(), role: user.role });

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
    return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
  }
}
