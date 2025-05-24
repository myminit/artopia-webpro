import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp } = await req.json();
    const otpString = otp.toString();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (
      user.verificationOTP !== otpString || 
      !user.verificationOTPExpires ||
      user.verificationOTPExpires < new Date()
    ) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // ถ้า verify ผ่าน
    user.isVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;
    await user.save();

    return NextResponse.json({ message: 'Account verified successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
