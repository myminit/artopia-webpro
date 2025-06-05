// File: app/admin/report/[reportid]/page.jsx
'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminHeadLogo from "@/components/admin/adminheadlogo";
import AdminNavbar from "@/components/admin/adminnavbar";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function AdminReportDetail() {
  const params = useParams();
  const reportId = params.reportid;
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/admin/report/${reportId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("Failed to fetch report:", res.status, errText);
          alert("ไม่พบรายงานหรือเกิดข้อผิดพลาด");
          router.push("/admin/report");
          return;
        }
        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("เกิดข้อผิดพลาดขณะโหลดรายงาน");
        router.push("/admin/report");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [reportId, router]);

  const handleDelete = async () => {
    if (!confirm("ต้องการลบรายงานนี้จริงหรือไม่?")) return;
    try {
      const res = await fetch(`/api/admin/report/${reportId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "ลบรายงานไม่สำเร็จ");
      }
      alert("ลบรายงานสำเร็จ");
      router.push("/admin/report");
    } catch (error) {
      console.error("Delete error:", error);
      alert("ลบรายงานไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">ไม่พบรายงาน</p>
      </div>
    );
  }

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
        <div className="ml-72 p-6 w-full overflow-y-auto">
          <button
            onClick={() => router.push("/admin/report")}
            className="mb-4 flex items-center text-black hover:opacity-70"
          >
            <ArrowLeftIcon className="w-6 h-6 mr-2" />
          </button>
          <h1 className="text-2xl font-bold text-purple-500 mb-6">
            Admin Users Reports
          </h1>

          <div className="bg-white rounded-xl p-6 shadow">
            {/* Report ID */}
            <div className="flex mb-2">
              <span className="inline-block w-36 text-gray-500">Report ID:</span>
              <span className="text-black">{report._id}</span>
            </div>

            {/* By User ID */}
            <div className="flex mb-2">
              <span className="inline-block w-36 text-gray-500">By User ID:</span>
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => router.push(`/admin/user/${report.byUserId}`)}
              >
                {report.byUserId}
              </span>
            </div>

            {/* Report User ID */}
            <div className="flex mb-2">
              <span className="inline-block w-36 text-gray-500">
                Report User ID:
              </span>
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() =>
                  router.push(`/admin/user/${report.reportUserId}`)
                }
              >
                {report.reportUserId}
              </span>
            </div>

            {/* Last Update / Date */}
            <div className="flex mb-4">
              <span className="inline-block w-36 text-gray-500">Date/Time:</span>
              <span className="text-black">
                {new Date(report.updatedAt).toLocaleString()}
              </span>
            </div>

            {/* Reason for report */}
            <div className="mb-4">
              <label className="block mb-1 text-sm text-gray-700">
                Reason for report
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 bg-gray-50"
                value={report.reason}
                readOnly
              />
            </div>

            {/* Detail report */}
            <div className="mb-6">
              <label className="block mb-1 text-sm text-gray-700">
                Detail report
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 h-32 bg-gray-50"
                value={report.detail}
                readOnly
              />
            </div>

            {/* Delete Button */}
            <div className="mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
