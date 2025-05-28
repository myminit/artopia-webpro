// /app/api/canvas/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { Drawing } from '@/models/Drawing';

export async function POST(req: NextRequest) {
  try {
    const { image, name, createdAt, userId } = await req.json();

    if (!image || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // กำหนดค่า default
    const nameToSave      = name || 'untitled';
    const createdAtDate   = createdAt ? new Date(createdAt) : new Date();

    // ตรวจขนาด base64 ไม่ให้เกิน ~5MB
    if (image.length > 5 * 1024 * 1024 * 1.37) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    await connectDB();

    // สร้าง document ใหม่
    const created = await Drawing.create({
      image,
      name: nameToSave,
      userId,
      createdAt: createdAtDate,
    });

    // ตอบกลับด้วย id, ชื่อ และ createdAt จากตัวแปรของเรา
    return NextResponse.json({
      message: 'Saved',
      drawing: {
        id: created._id,          // ObjectId
        name: nameToSave,         // ใช้ค่าที่เราเตรียมไว้
        createdAt: createdAtDate, // ใช้ค่าที่เราเตรียมไว้
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
