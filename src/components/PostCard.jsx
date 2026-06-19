import React, { useState, useRef } from "react";
import { usePostStore } from "../Store/postStore";
import { useAuthStore } from "../Store/AuthStore";
import { useMessagesStore } from "../Store/messagesStore";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaShareAlt,
  FaTrash,
  FaPaperPlane,
} from "react-icons/fa";
import { HiOutlinePhotograph } from "react-icons/hi";
import notP from "../pages/user.jpg";

// ─── Create Post Box ─────────────────────────────────────────────
export const CreatePostBox = () => {
  const { createPost, createPostLoading } = usePostStore();
  const { currUser } = useAuthStore();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageBase64) return;
    try {
      await createPost({ text: text.trim(), image: imageBase64 || "" });
      setText("");
      setImagePreview(null);
      setImageBase64(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex gap-3">
        <img
          src={currUser?.profile?.pic || notP}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share something with the community..."
            className="w-full resize-none border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 min-h-[80px] transition-all"
            rows={3}
          />
          {imagePreview && (
            <div className="relative mt-2 inline-block">
              <img
                src={imagePreview}
                alt="preview"
                className="max-h-48 rounded-lg object-cover"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setImageBase64(null);
                }}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-amber-50"
            >
              <HiOutlinePhotograph className="w-5 h-5" />
              Photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              onClick={handleSubmit}
              disabled={createPostLoading || (!text.trim() && !imageBase64)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
            >
              {createPostLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
              ) : (
                <FaPaperPlane className="w-3.5 h-3.5" />
              )}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Share Modal ──────────────────────────────────────────────────
const ShareModal = ({ post, onClose }) => {
  const { sideBarUsers, getSideBarUsers, sideBarUsersLoading } = useMessagesStore();
  const { sendMessage, setSelectedUser } = useMessagesStore();
  const [sent, setSent] = useState({});

  React.useEffect(() => {
    getSideBarUsers();
  }, []);

  const handleShare = async (user) => {
    try {
      setSelectedUser(user);
      // Small delay so store has the selected user
      await new Promise((r) => setTimeout(r, 100));
      const sharedPostData = {
        id: post._id,
        text: post.text || "",
        image: post.image || "",
        authorName: post.author?.username || "Someone",
        authorPic: post.author?.profile?.pic || ""
      };
      await sendMessage({
        text: `[SHARED_POST]:${JSON.stringify(sharedPostData)}`,
      });
      setSent((prev) => ({ ...prev, [user._id]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Share in Chat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="overflow-y-auto max-h-[50vh] p-2">
          {sideBarUsersLoading ? (
            <div className="p-8 text-center text-gray-400">Loading contacts...</div>
          ) : sideBarUsers?.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No contacts yet</div>
          ) : (
            sideBarUsers?.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profile?.pic || notP}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-700 text-sm">{user.username}</span>
                </div>
                <button
                  onClick={() => handleShare(user)}
                  disabled={sent[user._id]}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    sent[user._id]
                      ? "bg-green-100 text-green-600"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  {sent[user._id] ? "Sent ✓" : "Send"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Post Card ───────────────────────────────────────────────────
const PostCard = ({ post }) => {
  const { toggleLike, addComment, deleteComment, deletePost, likeLoading, commentLoading } = usePostStore();
  const { currUser } = useAuthStore();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  const isLiked = post.likes?.some(
    (like) => like.author?._id === currUser?._id || like.author === currUser?._id
  );
  const isOwner = post.author?._id === currUser?._id;

  const handleLike = () => toggleLike(post._id);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addComment(post._id, commentText.trim());
    setCommentText("");
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(`/profile/${post.author?.username}`)}
          >
            <img
              src={post.author?.profile?.pic || notP}
              alt=""
              className="w-11 h-11 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                {post.author?.username}
              </h4>
              <p className="text-xs text-gray-400">
                {post.author?.profile?.role === "shopowner" ? "Shop Owner" : "Home Maker"}
                {post.author?.shopName ? ` · ${post.author.shopName}` : ""}
                {" · "}
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => {
                if (window.confirm("Delete this post?")) deletePost(post._id);
              }}
              className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Text */}
        {post.text && (
          <p className="px-4 pb-2 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {post.text}
          </p>
        )}

        {/* Image */}
        {post.image && (
          <div className="w-full bg-gray-100">
            <img
              src={post.image}
              alt="post"
              className="w-full max-h-[500px] object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Stats bar */}
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
          <span>
            {post.likes?.length || 0} {post.likes?.length === 1 ? "like" : "likes"}
          </span>
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:text-gray-600 hover:underline transition-colors"
          >
            {post.comments?.length || 0} comments
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center border-b border-gray-100">
          <button
            onClick={handleLike}
            disabled={likeLoading === post._id}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 ${
              isLiked ? "text-red-500" : "text-gray-500"
            }`}
          >
            {isLiked ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
            Like
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
          >
            <FaRegComment className="w-4 h-4" />
            Comment
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50"
          >
            <FaShareAlt className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="p-4 bg-gray-50/50">
            {/* Comment input */}
            <div className="flex gap-2 mb-3">
              <img
                src={currUser?.profile?.pic || notP}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  placeholder="Write a comment..."
                  className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || commentLoading === post._id}
                  className="bg-amber-500 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-amber-600 disabled:opacity-40 transition-colors flex-shrink-0"
                >
                  <FaPaperPlane className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Comment list */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {post.comments?.length === 0 && (
                <p className="text-center text-gray-400 text-xs py-2">No comments yet. Be the first!</p>
              )}
              {post.comments?.map((comment) => (
                <div key={comment._id || comment.id} className="flex gap-2 group">
                  <img
                    src={comment.user?.profile?.pic || notP}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 cursor-pointer"
                    onClick={() => navigate(`/profile/${comment.user?.username}`)}
                  />
                  <div className="flex-1">
                    <div className="bg-white rounded-xl px-3 py-2 border border-gray-100">
                      <span
                        className="font-semibold text-xs text-gray-700 cursor-pointer hover:underline"
                        onClick={() => navigate(`/profile/${comment.user?.username}`)}
                      >
                        {comment.user?.username || "User"}
                      </span>
                      <p className="text-sm text-gray-600 mt-0.5">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
                      {(comment.user?._id === currUser?._id ||
                        comment.user === currUser?._id ||
                        isOwner) && (
                        <button
                          onClick={() => deleteComment(post._id, comment._id || comment.id)}
                          className="text-[10px] text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {showShareModal && <ShareModal post={post} onClose={() => setShowShareModal(false)} />}
    </>
  );
};

export default PostCard;
