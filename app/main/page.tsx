'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const [drawings, setDrawings] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('userId');
    setUserId(id);

    if (id) {
      fetch(`/api/canvas/load?userId=${id}`)
        .then((res) => res.json())
        .then((data) => setDrawings(data));
    }
  }, []);

  const handleEdit = (drawing) => {
    const encoded = encodeURIComponent(JSON.stringify(drawing.paths));
    router.push(`/draw?paths=${encoded}`);
  };

  const handleLogin = () => {
    router.push('/login'); // เปลี่ยนเป็น path ที่คุณใช้จริง
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-semibold mb-4">🔒 กรุณาเข้าสู่ระบบเพื่อดูแกลเลอรี่ของคุณ</h1>
        <button
          onClick={handleLogin}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎨 My Gallery</h1>

      {drawings.length === 0 ? (
        <p className="text-gray-500">📭 คุณยังไม่มีภาพวาดในแกลเลอรี่</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {drawings.map((item) => (
            <div key={item._id} className="border rounded shadow overflow-hidden">
              <img src={item.image} alt="drawing" className="w-full h-auto" />
              <div className="p-2 flex justify-between text-sm text-gray-600">
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:underline"
                >
                  ✏️ แก้ไข
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
