"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeadLogo from "@/components/HeadLogo";
// Like
import { HandThumbUpIcon as LikeSolid } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as LikeOutline } from "@heroicons/react/24/outline";

// heart
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
// Comment
import { ChatBubbleBottomCenterTextIcon as CommentIconOutline } from "@heroicons/react/24/outline";
// Report (Flag)
import { FlagIcon as FlagIconOutline } from "@heroicons/react/24/outline";
//send
import { PaperAirplaneIcon as SendOutline } from "@heroicons/react/24/outline";



// ตัวอย่าง mock data
const mockPosts = [
  {
    _id: "1",
    user: "Scarlett",
    caption: "My new drawing ✨",
    imageUrl: "https://placekitten.com/400/300",
    createdAt: "2024-04-25T14:00:00Z",
    comments: [
      { user: "dear", content: "Great drawing!", likes: 10 },
      { user: "Tin", content: "I love it!", likes: 5 },
    ],
  },
  {
    _id: "2",
    user: "TINNY",
    caption: "about cat",
    imageUrl: "/img/cat.jpg",
    createdAt: "2024-04-26T09:00:00Z",
    comments: [
      { user: "Bam", content: "So pretty!", likes: 7 },
    ],
  },
];

export default function PostDetailPage() {
  const params = useParams();
  const postid = params.postid;

  const [liked, setLiked] = useState(false);
  const [hearted, setHearted] = useState(false);

  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const [post, setPost] = useState(null);

  // นำข้อมูลโพสต์จาก mock data มาใช้
  useEffect(() => {
    if (!postid) return;

    const selectedPost = mockPosts.find((p) => p._id === postid);
    setPost(selectedPost || null);
  }, [postid]);


  if (!post) return <div>กำลังโหลด...</div>; // ถ้ายังไม่ได้โหลดข้อมูล

  return (
    <div className="min-h-screen">
      {/* HeadLogo */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Navbar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        {/* Main Content */}
        <main className="ml-72 flex-1 overflow-y-auto px-6 py-4 bg-white">
          {/* Post Content */}
          <div className="bg-white rounded-lg shadow p-4">
            <Image
              src={post.imageUrl}
              alt="โพสต์"
              width={600}
              height={400}
              className="rounded"
            />
            <div className="mt-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500"></div>
              <span className="font-semibold">{post.user}</span>
            </div>
            <p className="mt-2 text-gray-800">{post.caption}</p>
            <div className="mt-4 flex gap-6 text-gray-500 text-sm">
              <button
                onClick={() => setHearted(!hearted)}
                className="flex items-center gap-1 hover:opacity-70"
              >
                {hearted ? (
                  <HeartIconSolid className="w-6 h-6 text-black" />
                ) : (
                  <HeartIconOutline className="w-6 h-6 text-black" />
                )}
                <span>3,086 Likes</span>
              </button>
              <div className="flex items-center gap-1">
                <CommentIconOutline className="w-6 h-6 text-black" />
                <span>50 Comments</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 bg-sky-200 rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold mb-4">ความคิดเห็น</h3>

            {post.comments.map((comment, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                  <span className="font-semibold text-sm">{comment.user}</span>
                </div>
                <p className="text-sm">{comment.content}</p>
                <div className="flex gap-4 mt-1 text-xs text-gray-700">
                  <button
                    onClick={() => setLiked(!liked)}
                    className="hover:opacity-70"
                  >
                    {liked ? (
                      <LikeSolid className="w-6 h-6 text-black" />
                    ) : (
                      <LikeOutline className="w-6 h-6 text-black" />
                    )}
                  </button>

                  <CommentIconOutline className="w-6 h-6 text-black" />

                  <FlagIconOutline
                    className="w-6 h-6 text-black cursor-pointer"
                    onClick={() => setShowReportPopup(true)}
                  />
                </div>
              </div>
            ))}

            {/* Input comment */}
            <div className="mt-6 flex items-center border rounded px-2 bg-white">
              <input
                type="text"
                placeholder="Your comment"
                className="flex-1 px-2 py-1 outline-none"
              />
              <button className="p-2 text-sky-500">
                <SendOutline className="w-6 h-6 text-black " />
              </button>
            </div>
          </div>
        </main>
      </div>
      {showReportPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl relative">
            {/* ปุ่มปิด */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-semibold"
              onClick={() => setShowReportPopup(false)}
            >
              &times;
            </button>

            {/* หัวข้อ */}
            <h2 className="text-2xl font-semibold text-center mb-6">
              Report a problem
            </h2>

            {/* เลือกเหตุผล */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Reason for reporting
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option>Posting inappropriate work</option>
                <option>Spam</option>
                <option>Harassment or abuse</option>
                <option>Other</option>
              </select>
            </div>

            {/* กล่องเขียนเพิ่มเติม (แสดงตลอด) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your detailed report
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none outline-none focus:ring-2 focus:ring-sky-300"
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe the issue in detail..."
              />
            </div>

            {/* ปุ่ม */}
            <div className="flex flex-col gap-3 mt-6">
              <button
                className="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 rounded-full"
                onClick={() => {
                  console.log("ส่งรีพอร์ต:", reportReason, customReason);
                  setShowReportPopup(false);
                  setReportReason("");
                  setCustomReason("");
                }}
              >
                Send
              </button>
              <button
                className="w-full bg-sky-100 hover:bg-sky-200 text-gray-700 font-semibold py-2 rounded-full"
                onClick={() => setShowReportPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
