// /utils/auth.ts

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { IUser } from '@/models/User'; // ถ้าไม่มี ก็ลบบรรทัดนี้ออกได้

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id:   string;
  role: string;
}

// ── 1. ฟังก์ชันสร้าง JWT ───────────────────────────────────────────────
export function signToken(
  payload: TokenPayload,
  expiresIn: string = '7d'
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// ── 2. ฟังก์ชันตรวจสอบ JWT ───────────────────────────────────────────────
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (
      decoded &&
      typeof decoded === 'object' &&
      'id' in decoded &&
      'role' in decoded
    ) {
      return decoded as TokenPayload;
    }
    throw new Error('Invalid token payload');
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

// ── 3. ฟังก์ชันดึง token จาก cookie ─────────────────────────────────────────
export function getTokenFromReq(req: NextRequest): string | null {
  // req.cookies เป็น CookiesStore ของ NextRequest
  // แต่ NextRequest.cookies.get('token') จะคืน { name, value } | undefined
  const cookieStore = req.cookies.get('token');
  if (!cookieStore) return null;
  return cookieStore.value;
}

// ── 4. ฟังก์ชันดึง user จาก request ────────────────────────────────────────
export async function getUserFromReq(req: NextRequest): Promise<TokenPayload | null> {
  // สมมติว่า JWT เราเก็บไว้ใน cookie ชื่อ “token”
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // ตรวจว่า decoded มี shape เป็น TokenPayload หรือไม่
    if (
      decoded &&
      typeof decoded === 'object' &&
      'id' in decoded &&
      'role' in decoded
    ) {
      return decoded as TokenPayload;
    }
    return null;
  } catch (err) {
    console.error('JWT verify error:', err);
    return null;
  }
}

// ── 5. ฟังก์ชันตรวจสอบ role (ถ้ามี) ────────────────────────────────────────
export function isAdmin(user: IUser | TokenPayload) {
  return user.role === 'admin';
}
export function isUser(user: IUser | TokenPayload) {
  return user.role === 'user';
}
