'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headlogo";
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [caption, setCaption]       = useState<string>('');
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const router                      = useRouter();

  // ใช้ระบบเดียวกับหน้า Settings
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return; // ป้องกันการเปลี่ยนรูปถ้ายังไม่ล็อกอิน
    
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      return alert('กรุณาเข้าสู่ระบบก่อนโพสต์');
    }
    
    if (!imageFile || !caption.trim()) {
      return alert('กรุณาใส่รูปและคำบรรยายก่อนโพสต์');
    }

    // สร้าง FormData แล้ว append ทั้ง caption + file
    const formData = new FormData();
    formData.append('postText', caption.trim());
    formData.append('image', imageFile);

    try {
      const res = await fetch('/api/community/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (res.ok) {
        // ถ้าอัปโหลดสำเร็จ ให้กลับไปหน้า Community Feed
        router.push('/community');
      } else {
        const data = await res.json();
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('เกิดข้อผิดพลาดขณะอัปโหลด');
    }
  };

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

      <main className="ml-72 flex-1 overflow-y-auto px-6 py-4">
        <div className="py-2 mx-auto">
          <h1 className="text-4xl font-bold mb-6">Upload post</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Textarea */}
            <textarea
              className={`w-full p-8 border rounded-md mb-4 ${
                user 
                  ? 'border-gray-300 bg-gray-100 text-gray-900' 
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              placeholder={user ? "Write your post here" : "Please log in to write a post"}
              value={caption}
              onChange={(e) => user && setCaption(e.target.value)}
              rows={5}
              disabled={!user}
            />

            {/* Image Upload */}
            <div className={`border rounded-md p-12 flex flex-col items-center justify-center text-center mb-6 relative ${
              user 
                ? 'border-gray-200 bg-white' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              {preview && user ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 object-contain mb-4 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500 transition"
                    aria-label="Remove image"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <>
                  <PhotoIcon className={`w-18 h-18 mb-2 ${
                    user ? 'text-gray-400' : 'text-gray-300'
                  }`} />
                  <p className={`text-sm mb-2 ${
                    user ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {user ? 'Add photos or drag and drop' : 'Please log in to upload photos'}
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={!user}
              />
              <button
                type="button"
                style={{ backgroundColor: user ? "#29B3F1" : "#9CA3AF" }}
                className={`mt-2 px-4 py-2 text-white rounded-full transition inline-flex items-center gap-2 ${
                  user 
                    ? 'hover:opacity-90 cursor-pointer' 
                    : 'cursor-not-allowed opacity-60'
                }`}
                onClick={() => user && fileInputRef.current?.click()}
                disabled={!user}
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                Browse
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <button
                className={`w-full border py-2 rounded-md transition ${
                  user 
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer' 
                    : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                }`}
                type="button"
                onClick={() => {
                  if (user) {
                    setCaption('');
                    setImageFile(null);
                    setPreview(null);
                  }
                }}
                disabled={!user}
              >
                Cancel
              </button>
              <button
                style={{ backgroundColor: user ? "#29B3F1" : "#9CA3AF" }}
                className={`w-full text-white py-2 rounded-md transition ${
                  user 
                    ? 'hover:opacity-90 cursor-pointer' 
                    : 'cursor-not-allowed opacity-60'
                }`}
                type="submit"
                disabled={!user}
              >
                Post
              </button>
            </div>
          </form>

          {/* Guest Message */}
          {!user && (
            <div className="text-center pt-4">
              <p className="text-gray-500">
                You must{" "}
                <a
                  href="/login"
                  className="text-sky-500 underline hover:text-sky-600 font-medium"
                >
                  log in
                </a>{" "}
                to upload and share posts.
              </p>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}