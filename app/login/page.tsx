'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const loginResponse = await axios.post('/api/auth/login', { email, password });

      if (loginResponse.data.token) {
        // หากได้รับ JWT token จากการ login สำเร็จ
        localStorage.setItem('token', loginResponse.data.token);
        
        // ใช้ token ที่ได้รับ ไปดึงข้อมูลผู้ใช้จาก API /me
        const me = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${loginResponse.data.token}`, // ส่ง token ใน header
          }
        });

        // ตรวจสอบ role ของผู้ใช้
        if (me.data.role === 'admin') {
          // สมัครเสร็จ ไป /admin/dashboard
          router.push('/');
        } else if (me.data.role === 'user') {
          // สมัครเสร็จ ไป /user/dashboard
          router.push('/');
        } else {
          alert('Unknown role');
        }
      } else {
          alert('Login failed: No token received');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-400">
      <div className="flex flex-col items-center">
        <Image src="/img/logo.png" alt="Artopia Logo" width={80} height={80} />
        <h1 className="text-white text-3xl font-bold mt-2">Artopia</h1>
      </div>

      <div className="bg-white p-8 rounded-lg mt-6 w-96">
        <h2 className="text-center text-2xl font-semibold mb-6">Sign in</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2 mb-4 rounded"
        />
        <div className="relative mb-6">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full p-2 rounded"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500 text-sm"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="bg-sky-400 w-full py-2 text-white rounded font-semibold"
        >
          Log in
        </button>

        <div className="text-right text-sm mt-2">
          <a href="/forgot-password" className="underline">Forget your password</a>
        </div>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500 text-sm">New to our community</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <a
          href="/register"
          className="border w-full py-2 rounded text-center font-semibold block"
        >
          Create an account
        </a>
      </div>
    </div>
  );
}
