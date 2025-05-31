"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

import AdminNavbar from "@/components/admin/adminnavbar";
import HeadLogo from "@/components/admin/adminheadlogo";

import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function Adminuser() {
    const router = useRouter();
  // ✅ mock user data ใช้เฉพาะตอนยังไม่มี backend
  const [users, setUsers] = useState([
    {
      _id: "1",
      username: "mockuser1",
      email: "mock1@example.com",
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "2",
      username: "mockuser2",
      email: "mock2@example.com",
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [loading, setLoading] = useState(false); // ไม่มีการโหลดจริง

  const handleDelete = (id) => {
    if (!confirm("ต้องการลบผู้ใช้นี้จริงหรือไม่?")) return;
    setUsers(users.filter((u) => u._id !== id));
  };

  const handleEdit = (user) => {
    router.push(`/admin/user/${user._id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      {/* Sidebar + Main */}
      <div className="flex pt-[70px] h-screen">
        {/* Sidebar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <AdminNavbar />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-72 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-purple-500">Admin Users</h1>
            {/* Search bar */}
            <div className="flex-1 mx-6">
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full max-w-xl w-full mx-auto">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search ..."
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>
            </div>
            
          </div>

          {/* User Table */}
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      ไม่มีผู้ใช้งานในระบบ
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{user._id}</td>
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
