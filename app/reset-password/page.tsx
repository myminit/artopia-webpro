'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async () => {
    const email = localStorage.getItem('resetEmail');
    const otp = localStorage.getItem('resetOtp');

    if (!email || !otp) {
      alert('Missing reset session. Please start again.');
      router.push('/forgot-password');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', { email, otp, newPassword, });
      alert('Password reset successfully');
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetOtp');
      router.push('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Reset password failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-400">
      <Image src="/img/logo.png" alt="logo" width={80} height={80} />
      <div className="bg-white p-8 rounded-lg mt-6 w-96">
        <h2 className="text-center text-2xl font-semibold mb-6">Reset your password</h2>

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New password"
            className="border w-full p-2 rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500 text-sm"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <input
          type="password"
          placeholder="Confirm new password"
          className="border w-full p-2 mb-6 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleResetPassword}
          className="bg-sky-400 w-full py-2 text-white rounded font-semibold"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
