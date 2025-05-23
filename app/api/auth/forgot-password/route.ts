import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/config/db';
import { sendEmail } from '@/config/mailer';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const resetPasswordOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 นาทีหมดอายุ

    user.resetPasswordOTP = resetPasswordOTP;
    user.resetPasswordOTPExpires = resetPasswordOTPExpires;
    await user.save();

    await sendEmail({
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP is: ${resetPasswordOTP}`,
    });

    return NextResponse.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
