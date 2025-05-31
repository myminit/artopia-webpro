import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // 1. ให้ผู้มี token แล้ว ห้ามเข้าหน้า login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', req.url)); // ไปหน้า Home หรือ user
  }

  // 2. ถ้าเข้าหน้า admin หรือ user แต่ไม่มี token → redirect ไป /login
  if ((pathname.startsWith('/admin') || pathname.startsWith('/user')) && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/user/:path*'],
};
