// File: app/api/community/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    const updatedPosts = [];

    for (const post of posts) {
      let hasUpdates = false;
      const postData = post.toObject();

      // อัพเดทข้อมูล user ของ post
      const user = await User.findById(post.userId).select('avatar name').lean();
      if (user) {
        // อัพเดท avatar
        if (user.avatar !== post.userAvatar) {
          post.userAvatar = user.avatar || '';
          postData.userAvatar = user.avatar || '';
          hasUpdates = true;
        }
        // อัพเดท username
        if (user.name !== post.userName) {
          post.userName = user.name;
          postData.userName = user.name;
          hasUpdates = true;
        }
      }

      // อัพเดทข้อมูล user ใน comments
      if (post.comments && post.comments.length > 0) {
        postData.comments = [];
        for (const comment of post.comments) {
          const commentData = comment.toObject();
          const commentUser = await User.findById(comment.userId).select('avatar name').lean();
          
          if (commentUser) {
            // อัพเดท avatar ของ comment
            if (commentUser.avatar !== comment.userAvatar) {
              comment.userAvatar = commentUser.avatar || '';
              commentData.userAvatar = commentUser.avatar || '';
              hasUpdates = true;
            }
            // อัพเดท username ของ comment
            if (commentUser.name !== comment.userName) {
              comment.userName = commentUser.name;
              commentData.userName = commentUser.name;
              hasUpdates = true;
            }
          }

          // อัพเดทข้อมูล user ใน replies
          if (comment.replies && comment.replies.length > 0) {
            commentData.replies = [];
            for (const reply of comment.replies) {
              const replyData = reply.toObject();
              const replyUser = await User.findById(reply.userId).select('avatar name').lean();
              
              if (replyUser) {
                // อัพเดท avatar ของ reply
                if (replyUser.avatar !== reply.userAvatar) {
                  reply.userAvatar = replyUser.avatar || '';
                  replyData.userAvatar = replyUser.avatar || '';
                  hasUpdates = true;
                }
                // อัพเดท username ของ reply
                if (replyUser.name !== reply.userName) {
                  reply.userName = replyUser.name;
                  replyData.userName = replyUser.name;
                  hasUpdates = true;
                }
              }
              commentData.replies.push(replyData);
            }
          }
          postData.comments.push(commentData);
        }
      }

      if (hasUpdates) {
        await post.save();
      }
      updatedPosts.push(postData);
    }

    return NextResponse.json(updatedPosts, { status: 200 });
  } catch (err) {
    console.error('Error in /api/community/list:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
