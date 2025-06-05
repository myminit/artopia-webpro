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
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) return null;
        if (!res.ok) {
          console.error("Failed to fetch user:", res.status);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        // ถ้าไม่ใช่ admin ให้ redirect ออก
        if (!data || !isAdmin(data)) {
          router.push("/");
        }
      })
      .catch(() => setUser(null));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setShowDropdown(false);
    router.push("/");
  };

  return (
    <header className="relative flex items-center justify-between px-4 py-2 bg-purple-400 shadow-sm h-[70px]">
      {/* Logo + Title */}
      <div className="flex items-center space-x-2">
        <Image src="/img/logo.png" alt="Artopia Logo" width={32} height={32} />
        <h1 className="text-white text-xl px-2 font-bold flex items-center gap-2">
          Artopia
          <span className="bg-white text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2">
            ADMIN
          </span>
        </h1>
      </div>

      {/* Admin Profile Dropdown */}
      {user && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 px-2 py-1 rounded-lg transition duration-200"
          >
            {user.avatar && user.avatar !== "" ? (
              <Image
                src={user.avatar}
                alt="User Profile"
                width={32}
                height={32}
                className="rounded-full border border-purple-500"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold select-none text-base"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <span className="text-black text-base font-medium">
              {user.name} (Admin)
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl p-4 z-50 border border-gray-200">
              {/* Admin user info */}
              <div className="flex items-center gap-x-3 mb-3">
                {user.avatar && user.avatar !== "" ? (
                  <Image
                    src={user.avatar}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full border border-purple-500"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full border border-purple-500 bg-purple-400 flex items-center justify-center text-white font-bold text-base select-none"
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    {user.name}
                    <span className="text-purple-500 text-[10px] font-semibold bg-purple-100 px-1 rounded ml-1">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <div className="text-[10px] text-gray-400 mt-1 italic">
                    Administrator Access
                  </div>
                </div>
              </div>

              <hr className="mb-3 border-gray-200" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-x-2 text-left px-2 py-1 text-xs mt-1 hover:bg-red-50 rounded-lg transition"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}