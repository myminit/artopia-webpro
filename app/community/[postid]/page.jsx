"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"; 
import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";
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
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";

//send
import { PaperAirplaneIcon as SendOutline } from "@heroicons/react/24/outline";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

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
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  //const [hearted, setHearted] = useState(false);
  const [heartedPost, setHeartedPost] = useState(false);
  const [commentHearts, setCommentHearts] = useState({});

  //const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showPopupIndex, setShowPopupIndex] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [post, setPost] = useState(null);

  const [showPostReportPopup, setShowPostReportPopup] = useState(false);
  const [showCommentReportPopup, setShowCommentReportPopup] = useState(false);

  const [postReportReason, setPostReportReason] = useState("");
  const [postCustomReason, setPostCustomReason] = useState("");

  const [commentReportReason, setCommentReportReason] = useState("");
  const [commentCustomReason, setCommentCustomReason] = useState("");

  // นำข้อมูลโพสต์จาก mock data มาใช้
  useEffect(() => {
    if (!postid) return;

    const selectedPost = mockPosts.find((p) => p._id === postid);
    setPost(selectedPost || null);

    // สร้างค่า liked สำหรับแต่ละคอมเมนต์
    if (selectedPost) {
      const hearts = {};
      selectedPost.comments.forEach((_, index) => {
        hearts[index] = false; // ยังไม่ได้กด
      });
      setCommentHearts(hearts);
    }
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
        <main className="ml-72 flex-1 overflow-y-auto px-6 py-4 pt-6">
          <div className=" cursor-pointer">
            <button
              onClick={() => router.back()}
              className="text-black hover:opacity-70"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center px-6 pb-3 bg-white">
            <div className="flex flex-col lg:flex-row gap-6 w-full max-w-screen-xl">
              {/* Left: Post */}
              <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-md p-6">
                <Image
                  src={post.imageUrl}
                  alt="โพสต์"
                  width={800}
                  height={500}
                  className="rounded w-full max-w-[600px] mx-auto"
                />
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500"></div>
                    <span className="font-semibold">{post.user}</span>
                  </div>

                  <button
                    className="px-1 py-1 text-sm rounded hover:bg-gray-100 flex items-center gap-1 border "
                    onClick={() => setShowPostReportPopup(true)}
                  >
                    <FlagIconOutline className="w-6 h-6 text-black" />
                    Report
                  </button>
                </div>
                <p className="mt-2 text-gray-800">{post.caption}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-gray-500 text-sm items-center">
                  <button
                    onClick={() => setHeartedPost(!heartedPost)}
                    className="flex items-center gap-1 hover:opacity-70"
                  >
                    {heartedPost ? (
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
              {/* Right: Comments */}
              <div className="w-full lg:w-[480px] bg-sky-300 rounded-2xl p-4 flex flex-col h-[600px]">
                <h3 className="text-xl font-semibold mb-4">Comments</h3>
                {/* Scrollable Comment List */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {post.comments.map((comment, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                          <span className="font-semibold text-sm">
                            {comment.user}
                          </span>
                        </div>

                        {/* ... vertical icon */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowPopupIndex((prev) =>
                                prev === index ? null : index
                              )
                            }
                            className="text-black hover:opacity-80"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>

                          {/*  Popup with Flag */}
                          {showPopupIndex === index && (
                            <div className="absolute right-0 mt-1 bg-white rounded w-28 z-50">
                              <button
                                onClick={() => {
                                  setShowCommentReportPopup(true);
                                  setShowPopupIndex(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                              >
                                <FlagIconOutline className="w-4 h-4 mr-2" />
                                Report
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm">{comment.content}</p>

                      <div className="flex gap-4 mt-1 text-xs text-gray-700">
                        <button
                          onClick={() =>
                            setCommentHearts((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }))
                          }
                          className="flex items-center gap-1 hover:opacity-70"
                        >
                          {commentHearts[index] ? (
                            <HeartIconSolid className="w-5 h-5 text-black" />
                          ) : (
                            <HeartIconOutline className="w-5 h-5 text-black" />
                          )}
                        </button>

                        <CommentIconOutline className="w-5 h-5 text-black" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input comment */}
                <div className="mt-4 flex items-center border rounded px-2 bg-white">
                  <input
                    type="text"
                    placeholder="Your comment"
                    className="flex-1 px-2 py-1 outline-none"
                  />
                  <button className="p-2 text-sky-500">
                    <SendOutline className="w-6 h-6 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {showCommentReportPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl relative">
            {/* ปุ่มปิด */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-semibold"
              onClick={() => setShowCommentReportPopup(false)}
            >
              &times;
            </button>

            {/* หัวข้อ */}
            <h2 className="text-2xl font-semibold text-center mb-6">
              Report Comment
            </h2>

            {/* เลือกเหตุผล */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Reason for reporting this comment
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
                  console.log(
                    "Report Comment:",
                    commentReportReason,
                    commentCustomReason
                  );
                  setShowCommentReportPopup(false);
                  setCommentReportReason("");
                  setCommentCustomReason("");
                }}
              >
                Send
              </button>
              <button
                className="w-full bg-sky-100 hover:bg-sky-200 text-gray-700 font-semibold py-2 rounded-full"
                onClick={() => setShowCommentReportPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showPostReportPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-semibold"
              onClick={() => setShowPostReportPopup(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold text-center mb-6">
              Report Post
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Reason for reporting this post
              </label>
              <select
                value={postReportReason}
                onChange={(e) => setPostReportReason(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option>Posting inappropriate content</option>
                <option>Spam or misleading</option>
                <option>Violence or abuse</option>
                <option>Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Additional details (optional)
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
                rows={3}
                value={postCustomReason}
                onChange={(e) => setPostCustomReason(e.target.value)}
                placeholder="Describe the issue in detail..."
              />
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button
                className="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 rounded-full"
                onClick={() => {
                  console.log(
                    "Report Post:",
                    postReportReason,
                    postCustomReason
                  );
                  setShowPostReportPopup(false);
                  setPostReportReason("");
                  setPostCustomReason("");
                }}
              >
                Send Report
              </button>
              <button
                className="w-full bg-sky-100 hover:bg-sky-200 text-gray-700 font-semibold py-2 rounded-full"
                onClick={() => setShowPostReportPopup(false)}
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
