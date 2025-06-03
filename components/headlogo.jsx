"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function HeadLogo() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          // guest mode: ไม่ต้อง log error, ไม่ต้อง setUser(null) ซ้ำ
          return null;
        }
        if (!res.ok) {
          // error อื่นๆ (เช่น 500) ให้ log error
          console.error("Failed to fetch user:", res.status);
          return null;
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setShowDropdown(false);
    router.push("/");
  };

  return (
    <header className="relative flex items-center justify-between px-8 py-4 bg-sky-400 shadow-sm">
      {/* Logo + Title */}
      <div className="flex items-center space-x-2">
        <Image src="/img/logo.png" alt="Artopia Logo" width={40} height={40} />
        <h1 className="text-white text-3xl px-4 font-bold">Artopia</h1>
      </div>

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

      {/* User Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg transition duration-200"
        >
          {user?.avatar && user.avatar !== "" ? (
            <Image
              src={user.avatar}
              alt="User Profile"
              width={42}
              height={42}
              className="rounded-full"
            />
          ) : user ? (
            <div
              className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold select-none text-lg"
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Image
              src="/img/user.png"
              alt="User Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}

          <span className="text-black text-xl font-medium">
            {user ? user.name : "Guest"}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl p-5 z-50 border border-gray-200">
            {user ? (
              <>
                {/* Logged-in user info */}
                <div className="flex items-center gap-x-4 mb-4">
                  {user.avatar && user.avatar !== "" ? (
                    <Image
                      src={user.avatar}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="rounded-full border border-sky-200"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full border border-sky-200 bg-sky-500 flex items-center justify-center text-white font-bold text-xl select-none"
                      title={user.name}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-base text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400 mt-1 italic">
                      Passionate about AI & Art 🎨🤖
                    </div>
                  </div>
                </div>

                <hr className="mb-4 border-gray-200" />

                <Link
                  href="/settings"
                  className="w-full flex items-center gap-x-3 text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>Account Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-x-3 text-left px-3 py-2 text-sm mt-2 hover:bg-red-50 rounded-lg transition"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                {/* Guest / Not logged-in */}
                <div className="flex flex-col items-center text-center space-y-4 p-4">
                  <Image
                    src="/img/user.png"
                    alt="Guest"
                    width={56}
                    height={56}
                    className="rounded-full border border-gray-300 shadow-sm"
                  />

                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Guest Mode
                    </h3>
                    <p className="text-sm text-gray-500">
                      You're not signed in yet
                    </p>
                  </div>

                  <Link
                    href="/login"
                    className="w-full text-center bg-sky-500 text-white py-2 rounded-full hover:bg-sky-600 transition duration-200 font-medium shadow-sm"
                  >
                    Sign In
                  </Link>

                  <p className="text-xs text-gray-400 italic max-w-[220px]">
                    Join us and unleash your creativity
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
