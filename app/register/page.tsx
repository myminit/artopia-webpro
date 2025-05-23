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

  const handleRegister = async () => {
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axios.post('/api/auth/register', { name, email, password });
      localStorage.setItem('Email', email);
      // สมัครเสร็จ ไป /verify-email
      router.push('/verify-email');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
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

        <input
          type="text"
          placeholder="What should we call you?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border w-full p-2 mb-4 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2 mb-4 rounded"
        />

        <div className="relative mb-4">
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

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border w-full p-2 mb-6 rounded"
        />

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
