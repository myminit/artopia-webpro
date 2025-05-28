"use client";


import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";  // ใช้ custom hook แทนตรงนี้
import { useRouter } from "next/navigation"; // import useRouter


import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function HeadLogo() {
  const { user, logout } = useAuth(); // เรียกใช้ hook ที่คุณสร้างเอง
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout(); // ฟังก์ชัน logout ใน context ของคุณ ที่ลบ token และ set user = null
    setShowDropdown(false);
    router.push("/"); // redirect หลัง logout
  };
  /*const user = {
    name: "TINNY",
    email: "tinny@example.com",
    avatar: "/img/tin.png",
  };*/
  //const { user, loading } = useAuth();

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
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
            // กรณียังไม่ login ใช้รูป default
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
                  onClick={logout}
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
