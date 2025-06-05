// File: components/headLogo.jsx
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
  const [user, setUser] = useState(undefined); // undefined = loading, null = guest, object = user
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // สำหรับเก็บข้อความที่ค้นหา
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
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
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

  // เมื่อกด Enter ในช่องค้นหา
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchTerm.trim();
      if (query) {
        router.push(`/community?search=${encodeURIComponent(query)}`);
      }
    }
  };

  // เมื่อคลิกปุ่มแว่นขยาย
  const handleSearchClick = () => {
    const query = searchTerm.trim();
    if (query) {
      router.push(`/community?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-sky-400 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo + Title */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Image
            src="/img/logo.png"
            alt="Artopia Logo"
            width={40}
            height={40}
          />
          <h1 className="text-gray-800 text-3xl px-4 font-bold">Artopia</h1>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative flex-shrink-0">
          {user === undefined ? null : (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition duration-200"
            >
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200">
                  <Image
                    src={user?.avatar || "/img/user.png"}
                    alt="User Profile"
                    fill
                    sizes="32px"
                    className="object-cover"
                    priority
                  />
                </div>
                <span className="text-gray-800 font-medium">
                  {user?.name || "Guest"}
                </span>
              </div>
            </button>
          )}

          {user !== undefined && showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              ></div>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl p-5 z-50 border border-gray-200">
                {user ? (
                  <>
                    {/* Logged-in user info */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push("/settings");
                      }}
                      className="flex items-center gap-x-4 mb-4 w-full text-left hover:bg-gray-50 rounded-xl p-3 transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sky-200">
                        <Image
                          src={user.avatar || "/img/user.png"}
                          alt="Profile"
                          fill
                          sizes="48px"
                          className="object-cover"
                          priority
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base text-gray-800 truncate">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 italic truncate">
                          {user.bio || "Passionate about Art 🎨"}
                        </div>
                      </div>
                    </button>

                    <hr className="mb-4 border-gray-200" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-x-3 text-left px-3 py-2 text-sm hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Guest Mode */}
                    <div className="flex flex-col items-center text-center space-y-4 p-4">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm">
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
                        onClick={() => setShowDropdown(false)}
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
