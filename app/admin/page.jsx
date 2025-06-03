"use client";
import { useState, useEffect } from "react";
import HeadLogo from "@/components/HeadLogo";
import AdminHeadLogo from "@/components/admin/adminheadlogo";
import AdminNavbar from "@/components/admin/adminnavbar";

import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function Adminuser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (id) => {
      if (!confirm("ต้องการลบผู้ใช้นี้จริงหรือไม่?")) return;
      try {
        const res = await fetch(`/api/user/${id}`, { method: "DELETE" });
        if (res.ok) {
          setUsers(users.filter((u) => u._id !== id));
        } else {
          alert("ไม่สามารถลบผู้ใช้ได้");
        }
      } catch (err) {
        console.error("Error deleting user", err);
      }
    };

    const handleEdit = (user) => {
      // Placeholder - เปิด modal หรือ redirect ไปหน้าแก้ไขจริง ๆ
      alert(`Edit user: ${user.username}`);
    };

    const handleAdd = () => {
      // Placeholder - เปิด modal หรือ redirect ไปหน้าเพิ่ม user
      alert("เพิ่มผู้ใช้ใหม่");
    };

    useEffect(() => {
      fetchUsers();
    }, []);

    return (
      <div className="min-h-screen">
        <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
          <HeadLogo />
        </div>
        <div className="flex pt-[70px] h-screen">
          <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-red-500 z-40 shadow">
            <AdminNavbar />
          </div>

          <div className="flex-1 ml-72 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-sky-600">Admin Users</h1>
              <button
                onClick={handleAdd}
                className="bg-sky-500 text-white px-4 py-2 rounded shadow flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" /> Add User
              </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2">User ID</th>
                    <th className="px-4 py-2">Username</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Last update</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        ไม่มีผู้ใช้งานในระบบ
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{user.username}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 flex space-x-2">
                          <PencilIcon
                            className="h-5 w-5 text-blue-500 cursor-pointer"
                            onClick={() => handleEdit(user)}
                          />
                          <TrashIcon
                            className="h-5 w-5 text-red-500 cursor-pointer"
                            onClick={() => handleDelete(user._id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
}