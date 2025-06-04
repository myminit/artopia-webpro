'use client';

import React, { useState, useRef } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [caption, setCaption]       = useState<string>('');
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const router                      = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
              className="w-full p-8 border border-gray-300 rounded-md bg-gray-100 mb-4"
              placeholder="Write your post here"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
            />

            {/* Image Upload */}
            <div className="border border-gray-200 rounded-md p-12 flex flex-col items-center justify-center text-center mb-6 relative">
              {preview ? (
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
                  <PhotoIcon className="w-18 h-18 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-2">
                    Add photos or drag and drop
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                style={{ backgroundColor: "#29B3F1" }}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:opacity-90 transition inline-flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                Browse
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <button
                className="w-full border border-gray-300 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                type="button"
                onClick={() => {
                  setCaption('');
                  setImageFile(null);
                  setPreview(null);
                }}
              >
                Cancel
              </button>
              <button
                style={{ backgroundColor: "#29B3F1" }}
                className="w-full text-white py-2 rounded-md hover:opacity-90 transition"
                type="submit"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </main>
      </div>
    </div>
  );
}
