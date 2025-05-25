'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // เพิ่ม state สำหรับเก็บข้อความ error ของแต่ละช่อง
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleRegister = async () => {
    // เคลียร์ error ก่อนส่ง
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    let hasError = false;

    if (!name.trim()) {
      setNameError('Please enter your name');
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError('Please enter your email');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email(e.g., user@example.com)');
      hasError = true;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return; // หากมี error ใดๆ หยุดไม่ส่ง request

    try {
      await axios.post('/api/auth/register', { name, email, password });
      localStorage.setItem('Email', email);
      router.push('/verify-email');
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-400">
      <div className="flex flex-col items-center">
        <Image src="/img/logo.png" alt="Artopia Logo" width={80} height={80} />
        <h1 className="text-white text-3xl font-bold mt-2">Artopia</h1>
      </div>

      <div className="bg-white p-8 rounded-lg mt-6 w-96">
        <h2 className="text-center text-2xl font-semibold mb-2">Create account</h2>
        <p className="text-center text-sm mb-6">
          Already have an account? <a href="/login" className="underline">Log in</a>
        </p>

        {generalError && (
          <p className="text-red-600 text-center mb-4">{generalError}</p>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="What should we call you?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`border w-full p-2 rounded ${nameError ? 'border-red-500' : ''}`}
          />
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        </div>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`border w-full p-2 rounded ${emailError ? 'border-red-500' : ''}`}
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`border w-full p-2 rounded ${passwordError ? 'border-red-500' : ''}`}
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

        <div className="mb-6">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`border w-full p-2 rounded ${confirmPasswordError ? 'border-red-500' : ''}`}
          />
          {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
        </div>

        <button
          onClick={handleRegister}
          className="bg-sky-400 w-full py-2 text-white rounded font-semibold"
        >
          Create account
        </button>
      </div>
    </div>
  );
}
