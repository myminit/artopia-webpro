"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  UserGroupIcon,
  FlagIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { isAdmin } from "@/utils/auth";

export default function AdminNavbar() {
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
      .then((data) => {
        // ถ้าไม่ใช่ admin ให้ redirect ออก
        setUser(data);
        if (!data || !isAdmin(data)) {
          router.push("/");
        }
      })
      .catch(() => {
        setUser(null);
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/login");
  };

  const navItems = [
    { name: "Users", icon: UserGroupIcon, href: "/admin/user" },
    { name: "Reports", icon: FlagIcon, href: "/admin/report" },
  ];

  return (
    <nav className="w-72 h-[calc(100vh-70px)] bg-purple-400 text-white px-4 py-6 flex flex-col justify-between">
      <div className="space-y-4">
        {navItems.map((item) => {
          const isActive =
            activePath === item.href || activePath.startsWith(item.href + "/");        
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white text-purple-700 font-medium"
                  : "hover:bg-purple-600/70"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-purple-600/70 rounded-lg transition w-full"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
