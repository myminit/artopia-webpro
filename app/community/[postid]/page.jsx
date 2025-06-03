// app/community/[postid]/page.jsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";
import {
  HeartIcon as HeartIconSolid,
  HeartIcon as HeartIconOutline,
  FlagIcon as FlagIconOutline,
  ChatBubbleBottomCenterTextIcon as CommentIconOutline,
  ArrowLeftIcon,
  PaperAirplaneIcon as SendOutline,
} from '@heroicons/react/24/outline';

export default function PostDetailPage() {
  const { postid } = useParams();
  const router = useRouter();
  

  const [post, setPost] = useState(null);
  const [hearted, setHearted] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');

  // โหลดโพสต์จาก API
  useEffect(() => {
    fetch(`/api/community/${postid}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setComments(data.comments || []);
        setHearted(data.likes.includes(/* ใส่ userId ปัจจุบัน */));
      })
      .catch(console.error);
  }, [postid]);

  if (!post) return <p className="p-6">Loading...</p>;

  const toggleLike = () => {
    fetch(`/api/community/${postid}/like`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        setHearted(h => {
          // ค่านั้นกลับกัน
          const nextHearted = !h;
          // อัปเดตรายการ likes ใน state.post
          setPost(p => ({
            ...p,
            likes: nextHearted
              ? [...p.likes, userId]           // ถ้าเพิ่งมากด like
              : p.likes.filter(id => id !== userId), // ถ้าเพิ่งมากด unlike
          }));
          return nextHearted;
        });
      })
      .catch(console.error);
  };

  const submitComment = () => {
    if (!newComment.trim()) return;
    fetch(`/api/community/${postid}/comment`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment }),
    })
      .then((res) => res.json())
      .then((c) => {
        setComments((cs) => [...cs, c]);
        setNewComment('');
      })
      .catch(console.error);
  };

  const submitReport = () => {
    if (!reportReason) return;
    fetch(`/api/community/${postid}/report`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: reportReason,
        detail: reportDetail,
      }),
    })
      .then(() => {
        setShowReportPopup(false);
        setReportReason('');
        setReportDetail('');
      })
      .catch(console.error);
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        <main className="ml-72 flex-1 overflow-y-auto px-6 py-4 bg-white">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-4 text-black hover:opacity-70"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>

          {/* Post image */}
          <div className="flex justify-center mb-6">
            <Image
              src={post.imageUrl}
              alt={post.caption}
              width={800}
              height={500}
              className="rounded w-full max-w-[800px]"
            />
          </div>

          {/* Post header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">{post.userName}</h2>
            <button
              onClick={() => setShowReportPopup(true)}
              className="flex items-center gap-1 border px-2 py-1 rounded hover:bg-gray-100"
            >
              <FlagIconOutline className="w-5 h-5 text-black" /> Report
            </button>
          </div>

          <p className="mb-4">{post.caption}</p>

          {/* Like & count */}
          <button
            onClick={toggleLike}
            className="flex items-center gap-2 mb-6"
          >
            {hearted ? (
              <HeartIconSolid className="w-6 h-6 text-black" />
            ) : (
              <HeartIconOutline className="w-6 h-6 text-black" />
            )}
            <span>{post.likes.length} Likes</span>
          </button>

          {/* Comments list */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Comments</h3>
            {comments.map((c) => (
              <div key={c._id} className="mb-3 border-b pb-2">
                <p className="font-medium">{c.userName}</p>
                <p>{c.text}</p>
              </div>
            ))}
          </div>

          {/* New comment */}
          <div className="flex gap-2 items-center">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Your comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={submitComment} className="p-2">
              <SendOutline className="w-6 h-6 text-black" />
            </button>
          </div>
        </main>
      </div>

      {/* Report popup */}
      {showReportPopup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={() => setShowReportPopup(false)}
              className="absolute top-3 right-3 text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">Report Post</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full mb-4 border rounded px-3 py-2"
            >
              <option value="">-- Select reason --</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="spam">Spam</option>
              <option value="other">Other</option>
            </select>
            <textarea
              rows={3}
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
              className="w-full mb-4 border rounded px-3 py-2"
              placeholder="Additional details (optional)"
            />
            <button
              onClick={submitReport}
              className="w-full bg-red-500 text-white py-2 rounded mb-2"
            >
              Send Report
            </button>
            <button
              onClick={() => setShowReportPopup(false)}
              className="w-full border py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
