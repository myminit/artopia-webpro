"use client";
import {
  HomeIcon,
  PencilIcon,
  GlobeAltIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activePath, setActivePath] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    // ใช้ httpOnly cookie: fetch ด้วย credentials: "include"
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/");
  };

  const navItems = [
    { name: "Home", icon: HomeIcon, href: "/" },
    { name: "Draw", icon: PencilIcon, href: "/draw" },
    { name: "Community", icon: GlobeAltIcon, href: "/community" },
    { name: "Upload", icon: ArrowUpTrayIcon, href: "/upload" },
    { name: "Account setting", icon: Cog6ToothIcon, href: "/settings" },
  ];

  return (
    <nav className="w-50 h-[calc(100vh-70px)] bg-sky-400 text-white px-3 py-6 flex flex-col justify-between">
      {/* Top Menu */}
      <div className="space-y-3">
        {navItems.map((item) => {
          //const isActive = activePath === item.href;
          const isActive =
            activePath === item.href || activePath.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white text-sky-500 font-medium"
                  : "hover:bg-sky-300/40"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
      {/* Logout */}
      <div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-sky-300/40 rounded-lg transition w-full"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
