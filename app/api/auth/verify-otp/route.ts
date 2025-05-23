import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp } = await req.json();
    const otpString = otp.toString();

    const user = await User.findOne({
      email,
      resetPasswordOTP: otpString,
      resetPasswordOTPExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // ถ้าเจอ user และ otp ถูกต้อง
    return NextResponse.json({ message: 'OTP verified successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
