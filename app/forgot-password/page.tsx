'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSendOtp = async () => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      alert('OTP sent to your email');
      localStorage.setItem('resetEmail', email);
      router.push('/verify-otp');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error sending OTP');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-400">
      <Image src="/img/logo.png" alt="logo" width={80} height={80} />
      <div className="bg-white p-8 rounded-lg mt-6 w-96">
        <h2 className="text-center text-2xl font-semibold mb-6">Forgot your password?</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="border w-full p-2 mb-6 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSendOtp}
          className="bg-sky-400 w-full py-2 text-white rounded font-semibold"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}
