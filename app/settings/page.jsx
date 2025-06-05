"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headlogo";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            bio: data.bio || "",
          });
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please upload an image file" });
      return;
    }
    const formDataFile = new FormData();
    formDataFile.append("avatar", file);

    try {
      setLoading(true);
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formDataFile,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      setUser((prev) => ({ ...prev, avatar: data.avatarUrl }));
      setMessage({ type: "success", text: "Avatar updated successfully" });
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Failed to update avatar" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData = { name: formData.name, bio: formData.bio };
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updatedUser = await res.json();
      setUser(updatedUser);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header (fixed สูง 70px) */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      {/* Wrapper ด้านล่าง Header */}
      <div className="flex pt-[70px]">
        {/* Sidebar (fixed) */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        {/**
         * Main Content:
         * - ml-72: เว้นพื้นที่ซ้ายเท่าความกว้าง sidebar
         * - bg-white: พื้นหลังสีขาว
         * - p-4: padding รอบๆ
         * - overflow-y-auto: ให้ scroll ในตัว main เมื่อเนื้อหายาวเกิน
         * - min-h-[calc(100vh-70px)]: ยืดความสูงให้ครอบพื้นที่ตั้งแต่ใต้ header ลงไปจนจบ viewport
         */}
        <main
          className="ml-72 flex-1 overflow-y-auto bg-white p-4"
          style={{ minHeight: "calc(100vh - 70px)" }}
        >
          {!user ? (
            // Guest View: แสดงฟอร์มแบบ readonly
            <div className="w-full max-w-3xl bg-white p-12 shadow-xl rounded-xl mx-auto">
              <h2 className="text-2xl font-semibold text-sky-600 mb-8">
                Account Setting
              </h2>

              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-10">
                <label className="block text-sm text-gray-600 mb-4">
                  Your Profile Picture
                </label>
                <div className="relative w-32 h-32">
                  <img
                    src="/default-profile.jpg"
                    alt="Guest"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 opacity-60"
                  />
                  <div className="absolute inset-0 rounded-full bg-gray-200 bg-opacity-50 flex items-center justify-center text-sm text-gray-600 font-medium">
                    Not Logged In
                  </div>
                </div>
              </div>

              {/* Form Fields (readonly) */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value=""
                      readOnly
                      className="w-full p-3 rounded-lg bg-gray-100 text-gray-400 border border-gray-200"
                      placeholder="Please log in to view username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value=""
                      readOnly
                      className="w-full p-3 rounded-lg bg-gray-100 text-gray-400 border border-gray-200"
                      placeholder="Please log in to view email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    readOnly
                    className="w-full p-3 rounded-lg bg-gray-100 text-gray-400 min-h-[100px] border border-gray-200 resize-none"
                    placeholder="Please log in to view or edit your bio"
                  />
                </div>
                <div className="text-center pt-4">
                  <p className="text-gray-500">
                    You must{" "}
                    <a
                      href="/login"
                      className="text-sky-500 underline hover:text-sky-600 font-medium"
                    >
                      log in
                    </a>{" "}
                    to view and edit your account settings.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Logged-in View: แสดงฟอร์มแก้ไขได้
            <div className="w-full max-w-3xl bg-white p-12 shadow-xl rounded-xl mx-auto">
              <h2 className="text-2xl font-semibold text-sky-600 mb-8">
                Account Setting
              </h2>

              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-10">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Your Profile Picture
                </label>
                <div className="relative w-32 h-32">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                    />
                  ) : (
                    <div
                      className="w-32 h-32 rounded-full bg-sky-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-300"
                      title={user.name}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute inset-0 rounded-full cursor-pointer group">
                    <div className="w-full h-full bg-black bg-opacity-50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <CameraIcon className="w-8 h-8 text-white mb-2" />
                      <span className="text-sm text-white font-medium">
                        Change Photo
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Message Display */}
              {message.text && (
                <div
                  className={`p-4 mb-6 rounded-lg border ${
                    message.type === "error"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 focus:border-sky-400 focus:bg-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full p-3 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 focus:border-sky-400 focus:bg-white focus:outline-none transition-colors min-h-[100px] resize-none"
                    placeholder="Write your bio here..."
                  />
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-sky-500 text-white px-8 py-3 rounded-lg hover:bg-sky-600 transition-colors font-medium shadow-md ${
                      loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
                    }`}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        bio: user.bio || "",
                      });
                      setMessage({ type: "", text: "" });
                    }}
                    className="text-gray-600 hover:text-gray-800 px-8 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors font-medium"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
