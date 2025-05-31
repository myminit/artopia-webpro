"use client";
import { useState } from "react";
import AdminHeadLogo from "@/components/admin/adminheadlogo";
import AdminNavbar from "@/components/admin/adminnavbar";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { useParams } from "next/navigation";
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";


export default function Adminuserid() {
    const params = useParams();
    const userId = params.userid;
    const router = useRouter();

  const [user] = useState({
    id: userId,
    email: "TINNY@mail",
    lastUpdate: "24 Jun 2025",
    status: "Baned",
    banUntil: "30 Jun 2025",
    profilePicture: "/profile.jpg",
  });

  const [reports] = useState([
    { id: 1, byUserId: 1, reportUserId: 1, lastUpdate: "24 Jun 2023" },
    { id: 2, byUserId: 1, reportUserId: 1, lastUpdate: "24 Jun 2023" },
    { id: 3, byUserId: 1, reportUserId: 1, lastUpdate: "24 Jun 2023" },
  ]);

  const handleEdit = (user) => {
    console.log("Edit", user);
  };

  const handleDelete = (id) => {
    console.log("Delete", id);
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
                  {user.id}
                </p>
                <p>
                  <span className="inline-block min-w-[120px] text-gray-400">
                    Username:
                  </span>
                  {user.username}
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
                  {user.lastUpdate}
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
              <div className="text-center pl-8 pr-12">
                <p className="mb-2 font-semibold">Profile Picture</p>
                <Image
                  src={user.profilePicture}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
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
