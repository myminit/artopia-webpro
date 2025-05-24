import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import User from '@/models/User';
import connectDB from '@/config/db';

// เอาไว้รู้ว่าคนที่ login คือใคร
export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };

    if (!decoded?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select('-password'); // ไม่ต้องส่ง password กลับ

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}



/* ex how to use 

ในหน้า login.tsx (หรือ function ที่ทำการ login)
หลังจาก login สำเร็จ ได้ token แล้ว
ให้เราไปเรียก /api/auth/me
เพื่อเช็คว่า user role เป็นอะไร แล้ว redirect ไปตาม role เลย
import { useRouter } from 'next/navigation';
import axios from 'axios';

const router = useRouter();

const handleLogin = async () => {
  try {
    const res = await axios.post('/api/auth/login', { email, password });
    
    // หลัง login เสร็จ ไปดึงข้อมูลตัวเอง
    const me = await axios.get('/api/auth/me');

    if (me.data.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/dashboard');
    }
  } catch (error) {
    console.error(error);
    // show error message
  }
}


เช่น /login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });

      const me = await axios.get('/api/auth/me');

      if (me.data.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-2"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-4"
      />

      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
        Login
      </button>
    </div>
  );
}

สรุปง่าย ๆ:
User กรอก email / password
กดปุ่ม ➡️ วิ่งเข้า handleLogin
ถ้า login สำเร็จ ➡️ ไปหน้า admin หรือ user dashboard ตาม role


*/