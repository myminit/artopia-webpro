import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/config/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.resetPasswordOTP !== otp || !user.resetPasswordOTPExpires || user.resetPasswordOTPExpires < new Date()) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // เปลี่ยนรหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // เคลียร์ OTP ออก
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
