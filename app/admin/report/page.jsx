"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import AdminNavbar from "@/components/admin/adminnavbar";
import HeadLogo from "@/components/admin/adminheadlogo";

import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function AdminReports() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // state สำหรับ Search

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/admin/report", {
          credentials: "include",
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("Failed to fetch reports:", res.status, errText);
          alert("ไม่สามารถโหลดรายงานได้");
          return;
        }
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("เกิดข้อผิดพลาดขณะโหลดรายงาน");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleDelete = (id) => {
    if (!confirm("ต้องการลบรายงานนี้จริงหรือไม่?")) return;

    fetch(`/api/admin/report/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("ลบรายงานไม่สำเร็จ");
        setReports(reports.filter((r) => r._id !== id));
        alert("ลบรายงานสำเร็จ");
      })
      .catch((err) => {
        console.error(err);
        alert("ลบรายงานไม่สำเร็จ");
      });
  };

  const handleEdit = (report) => {
    router.push(`/admin/report/${report._id}`);
  };

  // ฟังก์ชันกรองรายการรายงานตาม searchTerm
  const filteredReports = reports.filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      r._id.toLowerCase().includes(term) ||
      r.byUserId.toLowerCase().includes(term) ||
      r.reportUserId.toLowerCase().includes(term)
    );
  });

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
            <h1 className="text-2xl font-bold text-purple-500">
              Admin User Reports
            </h1>
            <div className="flex-1 mx-6">
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full max-w-xl w-full mx-auto">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search ..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Report Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Report ID</th>
                  <th className="px-4 py-2">By User ID</th>
                  <th className="px-4 py-2">Report User ID</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      ไม่พบรายงานตามผลการค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{report._id}</td>
                      <td className="p-3">
                        <span
                          onClick={() => router.push(`/admin/user/${report.byUserId}`)}
                          className="cursor-pointer text-blue-600 hover:underline"
                        >
                          {report.byUserId}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          onClick={() => router.push(`/admin/user/${report.reportUserId}`)}
                          className="cursor-pointer text-blue-600 hover:underline"
                        >
                          {report.byUserId}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(report.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 flex space-x-2">
                        <PencilIcon
                          className="h-5 w-5 text-blue-500 cursor-pointer"
                          onClick={() => handleEdit(report)}
                        />
                        <TrashIcon
                          className="h-5 w-5 text-red-500 cursor-pointer"
                          onClick={() => handleDelete(report._id)}
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
