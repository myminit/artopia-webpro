// components/headLogo.jsx
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function HeadLogo() {
  // ลบ type annotation ออก ให้เหลือแค่ useState(null)
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
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (res.ok) {
        setUser(null);
        setShowDropdown(false);
        router.push("/login");
      } else {
        console.error("Logout failed:", res.status);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
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
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              {/* ใช้ไฟล์ PNG/Fallback จาก /public/img/user.png */}
              <Image
                src={user?.avatar || "/img/user.png"}
                alt="User Profile"
                fill
                sizes="32px"
                className="object-cover"
                priority
              />
            </div>
            <span className="text-black">{user?.name || "Guest"}</span>
          </div>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl p-5 z-50 border border-gray-200">
            {user ? (
              <>
                {/* Logged-in user info */}
                <div className="flex items-center gap-x-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-sky-200">
                    <Image
                      src={user.avatar || "/img/user.png"}
                      alt="Profile"
                      fill
                      sizes="48px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-base text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400 mt-1 italic">
                      Passionate about Art 🎨
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
                {/* Guest Mode */}
                <div className="flex flex-col items-center text-center space-y-4 p-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-300 shadow-sm">
                    <Image
                      src="/img/user.png"
                      alt="Guest"
                      fill
                      sizes="56px"
                      className="object-cover"
                      priority
                    />
                  </div>

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
