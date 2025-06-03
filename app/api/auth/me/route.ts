import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import User from '@/models/User';
import connectDB from '@/config/db';

// เอาไว้รู้ว่าคนที่ login คือใคร
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // อ่าน token จาก cookie (httpOnly)
    const cookieHeader = req.headers.get('cookie') || "";
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch (err) {
      console.error('Token verify failed:', err);
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    if (!decoded?.id) {
      return NextResponse.json({ message: 'Unauthorized: Invalid payload' }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Auth GET error:', error);
    return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
  }
}
