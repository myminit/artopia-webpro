// /app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link  from 'next/link';
import { useRouter } from 'next/navigation';
import {
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/solid';

interface DrawingItem {
  _id: string;
  name: string;         // ตรงกับ field “name” ใน MongoDB
  imageUrl: string;
  thumbnailUrl: string;
  updatedAt: string;
}

export default function GalleryPage() {
  const router = useRouter();

  // สถานะล็อกอิน (null = กำลังเช็ก, false = ไม่ล็อกอิน, true = ล็อกอินแล้ว)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // รายการ Drawing ของ user
  const [items, setItems] = useState<DrawingItem[]>([]);

  // popupId = _id ของรูปที่เปิดเมนู (ellipsis) อยู่
  const [popupId, setPopupId] = useState<string | null>(null);

  // editingId = _id ของรูปที่กำลังแก้ชื่ออยู่
  const [editingId, setEditingId] = useState<string | null>(null);

  // newTitle = ข้อความที่จะใช้แก้ชื่อ (+ initialize = '')
  const [newTitle, setNewTitle] = useState<string>('');

  // ─── 1. เช็กล็อกอิน ─────────────────────────────────────────
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // ─── 2. ถ้าล็อกอินแล้ว ให้ fetch list ของ gallery ──────────
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/gallery/list', { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : []))
        .then((data: DrawingItem[]) => {
          setItems(data);
        })
        .catch(console.error);
    }
  }, [isLoggedIn]);

  // ─── ฟังก์ชันเปิด/ปิด popup เมนู … (ellipsis) ───────────────
  const togglePopup = (id: string) => {
    setPopupId((prev) => (prev === id ? null : id));
    setEditingId(null);
  };

  // ─── เริ่มโหมดแก้ชื่อ (กดไอคอนดินสอ) ─────────────────────────
  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setNewTitle(currentName);
  };

  // ─── บันทึกชื่อใหม่ (เมื่อ input หลุดโฟกัส) ───────────────────
  const saveTitle = async (id: string) => {
    if (!newTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const res = await fetch('/api/gallery/update-title', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newTitle: newTitle.trim() }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((d) => (d._id === id ? { ...d, name: newTitle.trim() } : d))
        );
      } else {
        console.error('Failed to update title:', await res.text());
      }
    } catch (err) {
      console.error('Error updating title:', err);
    } finally {
      setEditingId(null);
      setNewTitle('');
    }
  };

  // ─── ดาวน์โหลดไฟล์เต็ม ───────────────────────────────────────────
  const downloadFull = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.png`;
    a.click();
  };

  // ─── ลบรูป ───────────────────────────────────────────────────────
  const deleteItem = async (id: string) => {
    if (!confirm('คุณแน่ใจว่าจะลบรูปนี้?')) return;
    try {
      const res = await fetch(`/api/gallery/delete?drawingId=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setItems((prev) => prev.filter((d) => d._id !== id));
      } else {
        console.error('Failed to delete:', await res.text());
      }
    } catch (err) {
      console.error('Error deleting drawing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ───────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full h-[60px] bg-[#00AEEF] shadow z-50 flex items-center px-6">
        <h1 className="text-white text-xl font-bold">Artopia</h1>
        <div className="flex-1 mx-6">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 rounded-lg focus:outline-none"
          />
        </div>
        <div className="text-white font-medium">tin</div>
      </header>

      <div className="flex pt-[60px]">
        {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="fixed top-[60px] left-0 h-[calc(100vh-60px)] w-60 bg-[#00AEEF] text-white shadow-lg z-40">
          <nav className="mt-8 flex flex-col space-y-4 px-4">
            <Link href="/" className="hover:bg-blue-500 rounded-md px-3 py-2">
              Home
            </Link>
            <Link href="/draw" className="hover:bg-blue-500 rounded-md px-3 py-2">
              Draw
            </Link>
            <Link href="/community" className="hover:bg-blue-500 rounded-md px-3 py-2">
              Community
            </Link>
            <Link href="/upload" className="hover:bg-blue-500 rounded-md px-3 py-2">
              Upload
            </Link>
            <Link href="/account-setting" className="hover:bg-blue-500 rounded-md px-3 py-2">
              Account Setting
            </Link>
          </nav>
        </aside>

        {/* ─── Main Content ───────────────────────────────────────────────── */}
        <main className="ml-60 flex-1 overflow-y-auto p-6">
          {/* ─── Banner ──────────────────────────────────────────────── */}
          <div className="mb-8">
            <Image
              src="/img/banner.png"
              alt="Artopia Banner"
              width={1200}
              height={200}
              className="w-full h-auto object-cover rounded-lg"
              priority
            />
          </div>

          {/* ─── Section: My Gallery ─────────────────────────────────── */}
          <h2 className="text-3xl font-bold mb-6">My Gallery</h2>

          {isLoggedIn === null && (
            <p className="text-center text-gray-500">Loading...</p>
          )}
          {isLoggedIn === false && (
            <div className="text-center mt-12">
              <p className="mb-4 text-gray-700">
                กรุณาเข้าสู่ระบบเพื่อดู Gallery ของคุณ
              </p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-blue-500 text-white rounded"
              >
                Sign In
              </button>
            </div>
          )}
          {isLoggedIn === true && items.length === 0 && (
            <p className="text-center text-gray-500 mt-12">
              ยังไม่มีผลงานใน Gallery
            </p>
          )}
          {isLoggedIn === true && items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {items.map((d) => (
                <div
                  key={d._id}
                  className="relative bg-white border rounded-lg shadow p-2 hover:shadow-xl transition-shadow duration-200"
                >
                  {/* ปุ่มเมนู … (ellipsis) */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => togglePopup(d._id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Popup เมนู Edit / Download / Delete */}
                  {popupId === d._id && (
                    <div className="absolute top-10 right-2 bg-white border shadow-lg rounded-md w-44 p-3 z-50">
                      {editingId === d._id ? (
                        <input
                          autoFocus
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => saveTitle(d._id)}
                          className="w-full mb-2 p-1 border rounded text-sm focus:ring-2 focus:outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => startEditing(d._id, d.name)}
                          className="flex items-center mb-2 cursor-pointer"
                        >
                          <span className="truncate text-sm font-semibold">
                            {d.name}
                          </span>
                          <PencilSquareIcon className="w-4 h-4 ml-2 text-gray-600" />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mb-2">
                        อัปเดต: {new Date(d.updatedAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => downloadFull(d.imageUrl, d.name)}
                        className="flex items-center mb-2 text-sm text-gray-700 hover:text-blue-600"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        ดาวน์โหลด
                      </button>
                      <button
                        onClick={() => deleteItem(d._id)}
                        className="flex items-center text-sm text-gray-700 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        ลบ
                      </button>
                    </div>
                  )}

                  {/* Thumbnail ของรูป */}
                  <div className="w-full h-36 bg-gray-100 rounded-md overflow-hidden">
                    <Link href={`/draw?loadId=${d._id}`}>
                      {d.thumbnailUrl ? (
                        <Image
                          src={d.thumbnailUrl}
                          alt={d.name}
                          width={400}
                          height={400}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No preview
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* ชื่อรูป + วันที่อัปเดตใต้ Thumbnail */}
                  <div className="mt-2 text-center">
                    <p className="truncate font-semibold">{d.name}</p>
                    <p className="text-xs text-gray-500">
                      อัปเดต: {new Date(d.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
