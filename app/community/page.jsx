// File: app/community/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";
import {
  HeartIcon as HeartIconSolid,
  HeartIcon as HeartIconOutline,
  FlagIcon as FlagIconOutline,
  EllipsisVerticalIcon,
  ChatBubbleBottomCenterTextIcon as CommentIconOutline,
} from "@heroicons/react/24/outline";

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const [user, setUser] = useState(null);
  const [showGuestAlert, setShowGuestAlert] = useState(false);
  

  const toggleMenu = (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenId((prevId) => (prevId === postId ? null : postId));
  };

  useEffect(() => {
    // Fetch user info to check if guest
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));

    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/community/list', { credentials: 'include' });
        const data = await res.json();
        setPosts(data);
        const initLikes = {};
        data.forEach((p) => {
          initLikes[p._id] = false;
        });
        setLikedPosts(initLikes);
      } catch (err) {
        console.error('Fetch community failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Utility to check guest user
  const checkGuestUser = () => {
    if (!user) {
      setShowGuestAlert(true);
      return true;
    }
    return false;
  };

  const toggleLike = async (e, postId) => {
    e.preventDefault();
    // Check guest before like
    if (checkGuestUser()) return;
    try {
      await fetch(`/api/community/${postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId]
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: likedPosts[postId]
                  ? p.likes.filter((uid) => uid !== '')
                  : [...p.likes, '']
              }
            : p
        )
      );
    } catch (err) {
      console.error('Toggle like failed:', err);
    }
  };

  const openReport = (e, postId) => {
    e.preventDefault();
    // Check guest before report
    if (checkGuestUser()) return;
    setReportPostId(postId);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      alert('กรุณาเลือกเหตุผลก่อน');
      return;
    }
    try {
      await fetch(`/api/community/${reportPostId}/report`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reportReason,
          detail: reportDetail
        })
      });
      setShowReportModal(false);
      setReportReason('');
      setReportDetail('');
      alert('Report ส่งเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Submit report failed:', err);
      alert('เกิดข้อผิดพลาดในการรายงาน');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeadLogo />
        <div className="flex pt-[60px]">
          <aside className="fixed top-[60px] left-0 h-[calc(100vh-60px)] w-60 bg-[#00AEEF] z-40 shadow-lg">
            <Navbar />
          </aside>
          <main className="ml-60 flex-1 flex items-center justify-center">
            <p className="text-gray-500">กำลังโหลด...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white shadow z-50">
        <HeadLogo />
      </div>

      <div className="flex pt-[70px] h-screen">
        {/* Navbar */}
        <div className="fixed top-[70px] left-0 h-[calc(100vh-70px)] w-72 bg-sky-400 z-40 shadow">
          <Navbar />
        </div>

        <main className="ml-72 flex-1 overflow-y-auto px-6 py-4 bg-white">
          <h2 className="text-4xl font-bold text-black mb-6">Community</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/community/${post._id}`} passHref>
                <div className="relative bg-white rounded-lg shadow-sm hover:shadow-lg transition cursor-pointer">
                  <div className="bg-[#00AEEF] text-white flex items-center justify-between px-4 py-2 rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.userAvatar || "/img/default-avatar.png"}
                        alt={post.userName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-medium text-sm">{post.userName}</span>
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => toggleMenu(e, post._id)}
                        className="hover:opacity-80"
                      >
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>

                      {menuOpenId === post._id && (
                        <div
                          className="absolute right-0 mt-2 w-28 bg-white text-black rounded-md shadow-lg z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => openReport(e, post._id)}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded "
                          >
                            <FlagIconOutline className="w-4 h-4 mr-2" />
                            Report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-gray-800 text-sm truncate">
                      {post.caption}
                    </p>
                  </div>

                  <div className="px-4 pb-4 flex items-center space-x-6 text-gray-600">
                    <button
                      onClick={(e) => toggleLike(e, post._id)}
                      className="flex items-center space-x-1 text-black"
                    >
                      {likedPosts[post._id] ? (
                        <HeartIconSolid className="w-5 h-5 fill-current" />
                      ) : (
                        <HeartIconOutline className="w-5 h-5 " />
                      )}
                      <span className="text-xs">{post.likes.length || 0}</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <CommentIconOutline className="w-5 h-5" />
                      <span className="text-xs">
                        {post.comments.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
      
      
      {showReportModal && (
        <div className="fixed inset-0 z-50  bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4">Report a problem</h3>
            <label className="block text-sm font-medium mb-1">
              Reason for reporting
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">-- Select reason --</option>
              <option value="Posting inappropriate work">
                Posting inappropriate work
              </option>
              <option value="Harassing/Trolling">Harassing/Trolling</option>
              <option value="Linking to inappropriate sites">
                Linking to inappropriate sites
              </option>
              <option value="Unsuitable content on profile">
                Unsuitable content on profile
              </option>
              <option value="Reproducing others' work">
                Reproducing others' work
              </option>
              <option value="Violating others' privacy">
                Violating others' privacy
              </option>
              <option value="This work depicts child pornography or child abuse">
                This work depicts child pornography or child abuse
              </option>
              <option value="Indicating intent to commit suicide or a crime">
                Indicating intent to commit suicide or a crime
              </option>
              <option value="Causing problems on pixiv Encyclopedia">
                Causing problems on pixiv Encyclopedia
              </option>
              <option value="Other violations of Terms of Use">
                Other violations of Terms of Use
              </option>
            </select>

            <label className="block text-sm font-medium mb-1">
              Your detailed report
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 resize-none focus:outline-none"
              placeholder="Optional details"
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
            ></textarea>

            <div className="flex justify-end space-x-2">
              <button
                onClick={submitReport}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90"
              >
                Send
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Alert Modal */}
      {showGuestAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-semibold"
              onClick={() => setShowGuestAlert(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold text-center mb-4">
              Login Required
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Please sign in to interact with posts and comments.
            </p>
            <div className="flex flex-col gap-3">
              <button
                className="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 rounded-full"
                onClick={() => {
                  setShowGuestAlert(false);
                  window.location.href = "/login";
                }}
              >
                Login
              </button>
              <button
                className="w-full bg-sky-100 hover:bg-sky-200 text-gray-700 font-semibold py-2 rounded-full"
                onClick={() => setShowGuestAlert(false)}
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
