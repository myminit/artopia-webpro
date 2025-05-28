import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { PDFDocument, rgb } from 'pdf-lib';

export async function POST(req: Request) {
  const { imageData, type } = await req.json();

  if (!imageData || !type) {
    return NextResponse.json({ error: 'Missing imageData or type' }, { status: 400 });
  }

  // ตัด prefix เช่น "data:image/png;base64,"
  const base64 = imageData.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');

  try {
    if (type === 'pdf') {
      const pdfDoc = await PDFDocument.create();
      const image = await pdfDoc.embedPng(buffer);
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      const pdfBytes = await pdfDoc.save();
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="drawing.pdf"',
        },
      });
    }

    // สำหรับ PNG และ JPEG
    const converted = await sharp(buffer)
      .toFormat(type === 'jpeg' ? 'jpeg' : 'png')
      .toBuffer();

    return new NextResponse(converted, {
      headers: {
        'Content-Type': type === 'jpeg' ? 'image/jpeg' : 'image/png',
        'Content-Disposition': `attachment; filename="drawing.${type}"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
