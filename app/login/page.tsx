'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleLogin = async () => {
    // เคลียร์ error ก่อนส่ง
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    /*try {
      const loginResponse = await axios.post('/api/auth/login', { email, password });
      
      if (loginResponse.data.token) {
        localStorage.setItem('token', loginResponse.data.token);

        const me = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${loginResponse.data.token}`,
          },
        });

        if (me.data.role === 'admin' || me.data.role === 'user') {
          router.push('/');
        } else {
          setGeneralError('Unknown role');
        }
      } else {
        setGeneralError('Login failed: No token received');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      if (message.toLowerCase().includes('email')) {
        setEmailError(message);
      } else if (message.toLowerCase().includes('password')) {
        setPasswordError(message);
      } else {
        setGeneralError(message);
      }
    }
  };*/
  //ประกาศ login(token) ใน AuthContext ไว้แล้วควรใช้ login(token) นั้นเพื่อให้ Context อัปเดต user ให้ทันที
  try {
    const loginResponse = await axios.post('/api/auth/login', { email, password });

    const token = loginResponse.data.token;

    if (token) {
      localStorage.setItem('token', token);

      // เรียก login จาก useAuth เพื่อโหลด user เข้าสู่ context
      await login(token);

      // เช็ก role หลัง login() เพื่อ redirect
      if (loginResponse.data.user?.role === 'admin' || loginResponse.data.user?.role === 'user') {
        router.push('/');
      } else {
        setGeneralError('Unknown role');
      }
    } else {
      setGeneralError('Login failed: No token received');
    }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      if (message.toLowerCase().includes('email')) {
        setEmailError(message);
      } else if (message.toLowerCase().includes('password')) {
        setPasswordError(message);
      } else {
        setGeneralError(message);
      }
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

        {generalError && (
          <p className="text-red-500 text-sm text-center mb-4">{generalError}</p>
        )}

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border w-full p-2 rounded"
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

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
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
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
