import { create } from "zustand";
import { axiosApi } from "../library/axios.js";

export const usePostStore = create((set, get) => ({
  // Feed state
  posts: [],
  feedLoading: false,
  feedError: null,
  currentPage: 1,
  hasMore: true,
  totalPosts: 0,

  // Create post state
  createPostLoading: false,
  createPostError: null,

  // Like state
  likeLoading: null, // stores postId being liked

  // Comment state
  commentLoading: null,

  // Reset feed (for pull-to-refresh)
  resetFeed: () => {
    set({ posts: [], currentPage: 1, hasMore: true, totalPosts: 0 });
  },

  // Get paginated feed
  getFeed: async (page = 1) => {
    try {
      if (page === 1) {
        set({ feedLoading: true, feedError: null });
      }
      const res = await axiosApi.get(`/posts/feed?page=${page}&limit=10`);
      const { posts: newPosts, hasMore, totalPosts, currentPage } = res.data;

      set((state) => ({
        posts: page === 1 ? newPosts : [...state.posts, ...newPosts],
        hasMore,
        totalPosts,
        currentPage,
        feedLoading: false,
      }));
    } catch (error) {
      console.error("Error in getFeed:", error);
      set({ feedError: "Failed to load posts", feedLoading: false });
    }
  },

  // Load next page
  loadMore: async () => {
    const { currentPage, hasMore, feedLoading } = get();
    if (!hasMore || feedLoading) return;
    await get().getFeed(currentPage + 1);
  },

  // Create a new post
  createPost: async (data) => {
    try {
      set({ createPostLoading: true, createPostError: null });
      const res = await axiosApi.post("/posts/create", data);
      // Prepend new post to feed
      set((state) => ({
        posts: [res.data, ...state.posts],
        totalPosts: state.totalPosts + 1,
        createPostLoading: false,
      }));
      return res.data;
    } catch (error) {
      console.error("Error in createPost:", error);
      set({
        createPostError: error.response?.data?.msg || "Failed to create post",
        createPostLoading: false,
      });
      throw error;
    }
  },

  // Toggle like
  toggleLike: async (postId) => {
    try {
      set({ likeLoading: postId });
      const res = await axiosApi.put(`/posts/like/${postId}`);
      // Replace the post in the feed
      set((state) => ({
        posts: state.posts.map((p) => (p._id === postId ? res.data : p)),
        likeLoading: null,
      }));
    } catch (error) {
      console.error("Error in toggleLike:", error);
      set({ likeLoading: null });
    }
  },

  // Add comment
  addComment: async (postId, text) => {
    try {
      set({ commentLoading: postId });
      const res = await axiosApi.post(`/posts/comment/${postId}`, { text });
      set((state) => ({
        posts: state.posts.map((p) => (p._id === postId ? res.data : p)),
        commentLoading: null,
      }));
    } catch (error) {
      console.error("Error in addComment:", error);
      set({ commentLoading: null });
    }
  },

  // Delete comment
  deleteComment: async (postId, commentId) => {
    try {
      const res = await axiosApi.delete(`/posts/comment/${postId}/${commentId}`);
      set((state) => ({
        posts: state.posts.map((p) => (p._id === postId ? res.data : p)),
      }));
    } catch (error) {
      console.error("Error in deleteComment:", error);
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      await axiosApi.delete(`/posts/${postId}`);
      set((state) => ({
        posts: state.posts.filter((p) => p._id !== postId),
        totalPosts: state.totalPosts - 1,
      }));
    } catch (error) {
      console.error("Error in deletePost:", error);
    }
  },
}));
