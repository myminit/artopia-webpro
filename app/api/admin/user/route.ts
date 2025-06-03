import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from "@/models/User";
import { getUserFromReq } from "@/utils/auth";

export async function GET(req: NextRequest) {
  try {
    // 1) ตรวจสอบว่าเป็น admin
    const userPayload = await getUserFromReq(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized (no token)' }, { status: 401 });
    }
    if (userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden (not admin)' }, { status: 403 });
    }

    // 2) เชื่อมต่อ MongoDB
    await connectDB();

    // 3) ดึงข้อมูล users ทั้งหมด (ไม่เอา password)
    const users = await User.find()
      .select('-password')
      .sort({ updatedAt: -1 });

    // 4) ส่งข้อมูลกลับ
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/admin/user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
