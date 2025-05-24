"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";


import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function HeadLogo() {
  const [showDropdown, setShowDropdown] = useState(false);

  const user = {
    name: "TINNY",
    email: "tinny@example.com",
    avatar: "/img/tin.png",
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
          <Image
            src={user.avatar}
            alt="User Profile"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-black text-xl font-medium">{user.name}</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl p-5 z-50 border border-gray-200">
            {/* User Info Section */}
            <div className="flex items-center gap-x-4 mb-4">
              <Image
                src={user.avatar}
                alt="Profile"
                width={48}
                height={48}
                className="rounded-full border border-sky-200"
              />
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

            {/* Menu Items */}
            <Link
              href="/settings"
              className="w-full flex items-center gap-x-3 text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition"
            >
              <Cog6ToothIcon className="w-5 h-5 " />
              <span>Account Settings</span>
            </Link>

            <button className="w-full flex items-center gap-x-3 text-left px-3 py-2 text-sm mt-2 hover:bg-red-50 rounded-lg transition">
              <ArrowRightOnRectangleIcon className="w-5 h-5 " />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
