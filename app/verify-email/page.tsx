'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();

    useEffect(() => {
      const savedEmail = localStorage.getItem('Email');
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
      await axios.post('/api/auth/verify-email', { email, otp: otp.toString() });
      alert('Email verified successfully!');
      // สมัครเสร็จ ไป /login
      router.push('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-400">
      <Image src="/img/logo.png" alt="logo" width={80} height={80} />
      <div className="bg-white p-8 rounded-lg mt-6 w-96">
        <h2 className="text-center text-2xl font-semibold mb-6">Verify your Email</h2>

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
