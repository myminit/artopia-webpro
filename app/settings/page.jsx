"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CameraIcon } from "@heroicons/react/24/outline";
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
    <div className="min-h-screen">
      {/* HeadLogo ด้านบน */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Navbar ด้านซ้าย */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>
        
        <main className="ml-72 flex-1 overflow-y-auto p-2 bg-white">
          {loading ? (
            <div className="text-center text-gray-500 mt-10">Loading...</div>
          ) : !user ? (
            <div className="max-w-5xl mx-auto bg-white p-16 shadow-xl rounded-xl">
              <h2 className="text-2xl font-semibold text-sky-600 mb-3">
                Account Setting
              </h2>

              <label className="block text-sm text-gray-600 mb-2">
                Your Profile Picture
              </label>
              <div className="relative w-24 h-24 mb-8">
                <img
                  src="/default-profile.jpg"
                  alt="Guest"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 opacity-60"
                />
                <div className="absolute inset-0 rounded-full bg-gray-200 bg-opacity-50 flex items-center justify-center text-xs text-gray-600">
                  Not Logged In
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value=""
                    readOnly
                    className="w-full p-2 rounded bg-gray-100 text-gray-400 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    readOnly
                    className="w-full p-2 rounded bg-gray-100 text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value=""
                    readOnly
                    className="w-full p-2 rounded bg-gray-100 text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    readOnly
                    className="w-full p-2 rounded bg-gray-100 text-gray-400"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    Bio
                  </label>
                  <textarea
                    readOnly
                    className="w-full p-2 rounded bg-gray-100 text-gray-400 min-h-[100px]"
                    placeholder="Please log in to view or edit your bio"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
                  <p className="text-gray-500 text-sm">
                    You must{" "}
                    <a
                      href="/login"
                      className="text-sky-500 underline hover:text-sky-600"
                    >
                      log in
                    </a>{" "}
                    to view and edit your account settings.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto bg-white p-16 shadow-xl rounded-xl">
              <h2 className="text-2xl font-semibold text-sky-600 mb-3">
                Account Setting
              </h2>

              <label className="block text-sm text-gray-600 mb-2">
                Your Profile Picture
              </label>
              <div className="relative w-24 h-24 mb-8">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full bg-sky-500 flex items-center justify-center text-white text-3xl font-bold border-2 border-gray-300"
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Overlay เมื่อ hover */}
                <label className="absolute inset-0 rounded-full cursor-pointer group">
                  <div className="w-full h-full bg-gray-500 bg-opacity-60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CameraIcon className="w-6 h-6 text-white mb-1" />
                    <span className="text-xs text-white">Change Profile</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Message Display */}
              {message.text && (
                <div
                  className={`p-4 mb-8 rounded ${
                    message.type === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-100 text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-100"
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full p-2 rounded bg-gray-100 text-gray-400"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-100"
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-100 min-h-[100px]"
                    placeholder="Write your bio here..."
                  />
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-start gap-4 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-sky-500 text-white px-6 py-2 rounded hover:bg-sky-600 transition ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        bio: user.bio || "",
                        password: "",
                        confirmPassword: "",
                      });
                      setMessage({ type: "", text: "" });
                    }}
                    className="text-gray-600 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
