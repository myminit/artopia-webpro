import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, isAdmin, isUser } from '@/utils/auth';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // หน้า public --> ผ่านได้เลย
  if (!pathname.startsWith('/user') && 
      !pathname.startsWith('/admin')
    ) {
    return NextResponse.next();
  }

  // ไม่มี token -> ไป login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = verifyToken(token);

    //# ยังไม่ได้ทำ new URL #//

    // ❌ User ห้ามเข้า admin page
    if (pathname.startsWith('/admin') && !isAdmin(decoded)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // ❌ Admin ห้ามเข้า user page
    if (pathname.startsWith('/user') && !isUser(decoded)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next(); // ✅ ผ่านได้
  } catch (error) {
    // Token ผิดพลาด -> logout
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/user/:path*', '/admin/:path*'],
};
