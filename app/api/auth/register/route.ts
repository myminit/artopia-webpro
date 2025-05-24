import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
import { sendEmail } from '@/config/mailer';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  try {
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 นาที

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationOTP,
      verificationOTPExpires,
      isVerified: false,
    });

    await sendEmail({
      to: email,
      subject: 'Verify your email',
      text: `Your OTP is ${verificationOTP}`,
    });

    return NextResponse.json({ message: 'User registered. Please verify your email.' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
