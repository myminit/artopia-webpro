"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { useParams } from "next/navigation";
import AdminHeadLogo from "@/components/admin/adminheadlogo";
import AdminNavbar from "@/components/admin/adminnavbar";
import {
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";


export default function AdminReportid() {
  const params = useParams();
  const reportId = params.reportid;
  const router = useRouter();

  const [report] = useState({
    id: reportId,
    byUserId: 1,
    reportUserId: 1,
    lastUpdate: "24 Jun 2025",
    reason: "",
    detail: "",
  });

  const handleDelete = () => {
    console.log("Deleting report:", report.id);
  };

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
            onClick={() => router.push("/admin/report")}
            className="text-black hover:opacity-70"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-purple-500 mb-4">
            Admin Users Reports
          </h1>

          <div className="bg-white rounded-xl p-6 shadow">
            <p>
              <span className="inline-block min-w-[150px] text-gray-500">
                Report ID
              </span>
              {report.id}
            </p>
            <p>
              <span className="inline-block min-w-[150px] text-gray-500">
                By User ID
              </span>
              {report.byUserId}
            </p>
            <p>
              <span className="inline-block min-w-[150px] text-gray-500">
                Report User ID
              </span>
              {report.reportUserId}
            </p>
            <p>
              <span className="inline-block min-w-[150px] text-gray-500">
                Last Update
              </span>
              {report.lastUpdate}
            </p>

            <div className="mt-4">
              <label className="block mb-1 text-sm text-gray-700">
                Reason for report
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={report.reason}
                readOnly
              />
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-sm text-gray-700">
                Detail report
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 h-32"
                value={report.detail}
                readOnly
              />
            </div>

            <div className="mt-6">
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
