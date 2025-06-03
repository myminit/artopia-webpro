// app/upload/page.tsx
'use client';
import { useState, useRef } from 'react';
import { PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [postText, setPostText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();
  const router = useRouter();

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!imageFile || !postText) return alert('กรุณาใส่ข้อความและรูปภาพ');

    const form = new FormData();
    form.append('postText', postText);
    form.append('image', imageFile);

    const res = await fetch('/api/community/upload', {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    if (res.ok) {
      router.push('/community'); // กลับไปหน้า feed
    } else {
      alert('Upload failed');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>
      <div className="flex pt-[70px] h-screen">
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>
        <main className="ml-72 flex-1 overflow-y-auto px-6 py-4">
          <h1 className="text-4xl font-bold mb-6">Upload Post</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              className="w-full p-4 border rounded-md"
              placeholder="Write your caption..."
              value={postText}
              onChange={e => setPostText(e.target.value)}
              rows={4}
            />
            <div className="border border-gray-200 rounded-md p-12 text-center relative">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-64 mb-4 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <>
                  <PhotoIcon className="mx-auto h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-2">Add photos or drag and drop</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full inline-flex items-center gap-2"
              >
                <ArrowUpTrayIcon className="w-5 h-5" /> Browse
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => { setPostText(''); setImageFile(null); setPreview(null); }}
                className="flex-1 border py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:opacity-90"
              >
                Post
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
