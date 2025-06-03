// /app/api/canvas/export/route.ts

import { NextRequest, NextResponse } from 'next/server';
import sharp                         from 'sharp';

export async function POST(req: NextRequest) {
  const { imageData, type } = await req.json();
  if (!imageData || !type) {
    return NextResponse.json({ error: 'Missing imageData or type' }, { status: 400 });
  }

  const base64 = imageData.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');

  if (type !== 'png' && type !== 'jpeg') {
    return NextResponse.json({ error: 'Unsupported export type' }, { status: 400 });
  }

  try {
    const converted = await sharp(buffer)
      .toFormat(type === 'jpeg' ? 'jpeg' : 'png')
      .toBuffer();

    return new NextResponse(converted, {
      headers: {
        'Content-Type':     type === 'jpeg' ? 'image/jpeg' : 'image/png',
        'Content-Disposition': `attachment; filename="drawing.${type}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}
