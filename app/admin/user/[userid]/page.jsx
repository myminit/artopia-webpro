"use client";
import { useState, useEffect } from "react";
import AdminHeadLogo from "@/components/admin/adminheadlogo";
import AdminNavbar from "@/components/admin/adminnavbar";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation"; 
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function Adminuserid() {
    const params = useParams();
    const userId = params.userid;
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [banUntil, setBanUntil] = useState("");
    const [loading, setLoading] = useState(true);

  const [reports, setReports] = useState([]);
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/user/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("โหลดข้อมูลผู้ใช้ล้มเหลว");

        const data = await res.json();
        setUser(data);
        setBanUntil(data.banUntil ? data.banUntil.slice(0, 10) : ""); // format YYYY-MM-DD
      } catch (err) {
        console.error(err);
        alert("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  const handleBanUpdate = async () => {
    try {
      const res = await fetch(`/api/admin/user/${userid}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBanned: true,
          banUntil: banUntil ? new Date(banUntil).toISOString() : null,
        }),
      });

      if (!res.ok) throw new Error("อัปเดตข้อมูลล้มเหลว");

      const updated = await res.json();
      setUser(updated);
      alert("บันทึกการแบนแล้ว");
    } catch (err) {
      console.error(err);
      alert("บันทึกไม่สำเร็จ");
    }
  };

  const handleDelete = async () => {
    if (!confirm("ลบผู้ใช้นี้จริงหรือไม่?")) return;

    try {
      const res = await fetch(`/api/admin/user/${userid}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("ลบไม่สำเร็จ");

      alert("ลบผู้ใช้เรียบร้อยแล้ว");
      router.push("/admin/user");
    } catch (err) {
      console.error(err);
      alert("ลบผู้ใช้ไม่สำเร็จ");
    }
  };
  if (!user) return <p>ไม่พบผู้ใช้</p>;
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <AdminHeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Sidebar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <AdminNavbar />
        </div>

        {/* Main Content */}
        <div className="ml-72 p-6 w-full">
          <button
            onClick={() => router.push("/admin/user")}
            className="text-black hover:opacity-70"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-purple-500 ">Admin Users</h1>

          {/* User Info */}
          <div className="bg-white rounded-xl p-6 shadow mb-6">
            <div className="flex justify-between items-start gap-8">
              <div>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    User ID:
                  </span>
                  {user._id}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Username:
                  </span>
                  {user.name}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Email:
                  </span>
                  {user.email}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Last Update:
                  </span>
                  {user.updatedAt}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Status:
                  </span>
                  {user.status}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Ban until:
                  </span>
                  {user.banUntil}
                </p>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl p-4 shadow mb-6">
            <h2 className="font-semibold mb-4 text-sky-500">
              List Users Reports
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr className="text-center">
                    <th className="p-3">Report ID</th>
                    <th className="p-3">By User ID</th>
                    <th className="p-3">Report User ID</th>
                    <th className="p-3">Last update</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="text-center hover:bg-gray-50"
                    >
                      <td className="p-3">{report.id}</td>
                      <td className="p-3">{report.byUserId}</td>
                      <td className="p-3">{report.reportUserId}</td>
                      <td className="p-3 text-sm">{report.lastUpdate}</td>
                      <td className="p-3">
                        <div className="flex justify-center space-x-2">
                          <button title="Edit">
                            <PencilIcon className="h-5 w-5 text-blue-500 cursor-pointer" />
                          </button>
                          <button title="Delete">
                            <TrashIcon className="h-5 w-5 text-red-500 cursor-pointer" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center mt-4 text-sm text-gray-500 px-1">
              <div className="space-x-2">
                <button className="px-2 py-1 border rounded hover:bg-gray-200">
                  {"<"}
                </button>
                <span>1 of 1</span>
                <button className="px-2 py-1 border rounded hover:bg-gray-200">
                  {">"}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-start space-x-4 mt-6">
            <button className="bg-yellow-400 text-black font-semibold py-1 px-6 rounded">
              Ban
            </button>
            <button className="bg-sky-400 text-white font-semibold py-1 px-6 rounded">
              UnBan
            </button>
            <button className="bg-red-500 text-white font-semibold py-1 px-6 rounded">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
