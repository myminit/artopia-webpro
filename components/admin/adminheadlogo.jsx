"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/utils/auth";
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function AdminHeadLogo() {
  const [user, setUser] = useState(undefined); // undefined = ยังไม่โหลด
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        // redirect ถ้าไม่ admin หรือ ไม่มี user
        if (!data || !isAdmin(data)) {
          router.push("/");
        }
      })
      .catch(() => {
        setUser(null);
        router.push("/login");
      });
  }, [router]);

  // รอโหลดข้อมูล user ให้เสร็จก่อน
  if (user === undefined) {
    // อาจแสดง spinner หรือ placeholder ได้
    return (
      <header className="p-4 bg-purple-400">
        <p className="text-white">Loading...</p>
      </header>
    );
  }

  // ถ้าไม่มี user หรือ ไม่ใช่ admin ให้ไม่แสดง UI
  if (!user || !isAdmin(user)) {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setShowDropdown(false);
    router.push("/");
  };

  return (
    <header className="relative flex items-center justify-between px-8 py-4 bg-purple-400 shadow-sm">
      {/* Logo + Title */}
      <div className="flex items-center space-x-2">
        <Image src="/img/logo.png" alt="Artopia Logo" width={40} height={40} />
        <h1 className="text-white text-3xl px-4 font-bold flex items-center gap-2">
          Artopia
          <span className="bg-white text-purple-700 text-xs font-semibold px-2 py-1 rounded-full ml-2">
            ADMIN
          </span>
        </h1>
      </div>

      {/* Admin Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg transition duration-200"
        >
          {user.avatar && user.avatar !== "" ? (
            <Image
              src={user.avatar}
              alt="User Profile"
              width={42}
              height={42}
              className="rounded-full border border-purple-500"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold select-none text-lg"
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <span className="text-black text-xl font-medium">
            {user.name} (Admin)
          </span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl p-5 z-50 border border-gray-200">
            {/* Admin user info */}
            <div className="flex items-center gap-x-4 mb-4">
              {user.avatar && user.avatar !== "" ? (
                <Image
                  src={user.avatar}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full border border-purple-500"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full border border-purple-500 bg-purple-400 flex items-center justify-center text-white font-bold text-xl select-none"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold text-base text-gray-800">
                  {user.name}
                  <span className="text-purple-500 text-xs font-semibold bg-purple-100 px-1 rounded ml-1">
                    ADMIN
                  </span>
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-xs text-gray-400 mt-1 italic">
                  Administrator Access
                </div>
              </div>
            </div>

            <hr className="mb-4 border-gray-200" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-x-3 text-left px-3 py-2 text-sm mt-2 hover:bg-red-50 rounded-lg transition"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}