import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  role: string;
}

// ฟังก์ชันสำหรับดึง secret พร้อมเช็คความถูกต้อง
function getJwtSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return JWT_SECRET;
}

// ฟังก์ชันสำหรับสร้าง JWT
export function signToken(payload: TokenPayload, expiresIn: string = '7d'): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn });
}

// ฟังก์ชันสำหรับตรวจสอบ JWT
export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    if (decoded && typeof decoded === 'object' && 'id' in decoded && 'role' in decoded) {
      return decoded as TokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// ฟังก์ชันตรวจสอบว่า user เป็น admin หรือไม่
export function isAdmin(user: TokenPayload | null): boolean {
  console.log("isAdmin(): payload =", user); 
  return !!user && user.role === 'admin';
}

// ฟังก์ชันตรวจสอบว่า user เป็น user หรือไม่
export function isUser(user: TokenPayload | null): boolean {
  return !!user && user.role === 'user';
}
