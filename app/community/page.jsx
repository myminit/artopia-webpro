// app/community/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import Navbar from "@/components/navbar";
import HeadLogo from "@/components/headLogo";

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    fetch('/api/community/list')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        // เตรียม state ไว้ว่ากดไลค์หรือยัง
        const initLikes = {};
        data.forEach((p) => {
          initLikes[p._id] = false;
        });
        setLikedPosts(initLikes);
      })
      .catch(console.error);
  }, []);

  const toggleLike = async (postId) => {
    // กันลิงก์เกิดขึ้น
    // เรียก API toggle like
    await fetch(`/api/community/${postId}/like`, {
      method: 'POST',
      credentials: 'include',
    });
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

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
          <h2 className="text-4xl font-bold text-black mb-6">Community</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/community/${post._id}`} passHref>
                <div className="relative bg-white border rounded-lg shadow-md p-2 hover:shadow-lg transition cursor-pointer">
                  {/* User Info */}
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/img/user.png"
                      alt="User"
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    <span className="text-black text-base font-medium">
                      {post.userName}
                    </span>
                  </div>

                  {/* Caption */}
                  <p className="text-sm font-medium mt-2 text-black">
                    {post.caption}
                  </p>

                  {/* Like Button */}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleLike(post._id);
                      }}
                      className="text-black transition-colors"
                    >
                      {likedPosts[post._id] ? (
                        <HeartIconSolid className="w-5 h-5 text-black hover:opacity-70" />
                      ) : (
                        <HeartIconOutline className="w-5 h-5 hover:text-black hover:opacity-70" />
                      )}
                    </button>
                  </div>

                  {/* Image */}
                  <div className="w-full h-36 bg-gray-100 rounded-md mt-2 overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
