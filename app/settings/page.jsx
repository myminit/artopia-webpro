"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          password: '',
          confirmPassword: '',
        });
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to upload image');

      const data = await res.json();
      console.log('API Response:', data);
      
      // Update local state with the new avatar URL
      setUser(prev => {
        console.log('Previous user state:', prev);
        const newState = { ...prev, avatar: data.avatarUrl };
        console.log('New user state:', newState);
        return newState;
      });
      setMessage({ type: 'success', text: 'Avatar updated successfully' });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Failed to update avatar' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match if provided
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        return;
      }
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        return;
      }
    }

    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        bio: formData.bio,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const updatedUser = await res.json();
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Clear passwords
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1">
        <HeadLogo />
        <main className="p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>

            {/* Avatar Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Profile Picture</h2>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="Profile"
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-sky-500 flex items-center justify-center text-white text-3xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="bg-white border border-gray-300 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                    Change Photo
                  </label>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message.text && (
              <div
                className={`p-4 mb-6 rounded-lg ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Write your bio here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      bio: user.bio || '',
                      password: '',
                      confirmPassword: '',
                    });
                    setMessage({ type: '', text: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
