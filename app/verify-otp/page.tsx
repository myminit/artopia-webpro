'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function VerifyResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) {
        alert('OTP must be exactly 6 digits');
        return;
    }
    
    try {
      await axios.post('/api/auth/verify-otp', { email, otp: otp.toString() });
      alert('OTP verified, please reset your password');
      localStorage.setItem('resetEmail', email);
      localStorage.setItem('resetOtp', otp.toString());
      // สมัครเสร็จ ไป /reset-password
      router.push('/reset-password');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-400">
      <Image src="/img/logo.png" alt="logo" width={80} height={80} />
      <div className="bg-white p-8 rounded-lg mt-6 w-96">
        <h2 className="text-center text-2xl font-semibold mb-6">Verify Reset OTP</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="border w-full p-2 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter OTP"
          className="border w-full p-2 mb-6 rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={handleVerify}
          className="bg-sky-400 w-full py-2 text-white rounded font-semibold"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
