import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import "../coustomStyles/home.css";
import "../coustomStyles/Compo.css";
import { ProfileComponent } from "../components/profileCard";
import { useNavigate, Link } from "react-router-dom";
import { IoSearchSharp } from "react-icons/io5";
import { axiosApi } from "../library/axios.js";
import SnapchatThread from "../skeletons/ProfileCardSkeleton";
import { useAuthStore } from "../Store/AuthStore.js";
import { usePostStore } from "../Store/postStore.js";
import PostCard, { CreatePostBox } from "../components/PostCard";

const Home = () => {
  const { currUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState("");

  // Posts infinite scroll
  const { posts, feedLoading, hasMore, getFeed, loadMore } = usePostStore();
  const observerRef = useRef(null);

  useEffect(() => {
    getFeed(1);
  }, []);

  // Infinite scroll with IntersectionObserver
  const lastPostRef = useCallback(
    (node) => {
      if (feedLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [feedLoading, hasMore, loadMore]
  );

  // Suggestions
  const handelSuggestions = async () => {
    try {
      const res = await axiosApi.get("/home/getSuggestedConnections");
      return res.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  const { data: suggestedConnections } = useQuery({
    queryKey: ["suggestedConnections"],
    queryFn: handelSuggestions,
  });

  // Search
  const { data: searchedUsers, isLoading } = useQuery({
    queryKey: ["searchedUsers", searchData],
    queryFn: async () => {
      if (!searchData) return [];
      try {
        const res = await axiosApi.get(`/home/searchperson?query=${searchData}`);
        return res.data;
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
    enabled: !!searchData,
  });

  return (
    <div className="dashCon">
      <div className="dashConItem">
        <div className="item1">
          <div className="item1Con CosCard min-h-screen w-screen">
            {/* Left sidebar - suggested shops */}
            <aside className="dashAside1 CosCard backdrop-blur-sm">
              <div className="suggestedBar">
                <h6 className="text-xl font-bold text-gray-700">Suggested Shops</h6>
              </div>
              <div className="suggestedPf mt-3">
                {suggestedConnections?.slice(0, 5).map((user, i) => (
                  <div
                    key={user._id || i}
                    className="p-2 hover:bg-amber-50 cursor-pointer rounded-lg transition-colors"
                    onClick={() => navigate(`/profile/${user.username}`)}
                  >
                    <ProfileComponent user={user} />
                    <hr className="mt-2 border-gray-100" />
                  </div>
                ))}
                {(!suggestedConnections || suggestedConnections.length === 0) && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    No suggestions yet
                  </p>
                )}
              </div>
            </aside>

            {/* Main feed */}
            <main className="dashMain w-full backdrop-blur-xs bg-white/10">
              {/* Search bar */}
              <div className="h-12 w-full rounded-2xl CosCard center padl-12">
                <div className="p-5 flex gap-4 w-full ml-12">
                  <div className="center searchIcon w-12 h-10">
                    <IoSearchSharp className="h-6 w-6" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search people, shops..."
                    value={searchData}
                    onChange={(e) => setSearchData(e.target.value)}
                    className="rounded-3xl w-2/3 bg-zinc-100 border-none focus:outline-none inputFilter"
                  />
                </div>
              </div>

              {/* Search results */}
              {searchData && (
                <div className="w-full CosCard mb-4 max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <SnapchatThread />
                  ) : searchedUsers?.length === 0 ? (
                    <p className="text-gray-400 text-sm p-4 text-center">No users found</p>
                  ) : (
                    searchedUsers?.map((user, index) => (
                      <div
                        key={user._id || index}
                        className="hover:bg-amber-50 transition-colors rounded-lg"
                      >
                        <ProfileComponent user={user} />
                        <hr className="border-gray-100" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Create post */}
              <CreatePostBox />

              {/* Post feed */}
              <div className="space-y-0">
                {feedLoading && posts.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-full bg-gray-200" />
                          <div className="space-y-2">
                            <div className="h-3 w-28 bg-gray-200 rounded" />
                            <div className="h-2 w-40 bg-gray-100 rounded" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-gray-100 rounded" />
                          <div className="h-3 w-3/4 bg-gray-100 rounded" />
                        </div>
                        <div className="h-48 bg-gray-100 rounded-lg mt-3" />
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                    <div className="text-5xl mb-3">📝</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No posts yet</h3>
                    <p className="text-gray-400 text-sm">
                      Be the first to share something with the community!
                    </p>
                  </div>
                ) : (
                  posts.map((post, index) => {
                    if (index === posts.length - 1) {
                      return (
                        <div ref={lastPostRef} key={post._id}>
                          <PostCard post={post} />
                        </div>
                      );
                    }
                    return <PostCard key={post._id} post={post} />;
                  })
                )}

                {/* Loading more indicator */}
                {feedLoading && posts.length > 0 && (
                  <div className="flex justify-center py-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="animate-spin w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full" />
                      <span className="text-sm">Loading more posts...</span>
                    </div>
                  </div>
                )}

                {/* End of feed */}
                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-300 text-xs">— You've reached the end —</p>
                  </div>
                )}
              </div>
            </main>

            {/* Right sidebar */}
            <aside className="dashAside2 CosCard backdrop-blur-sm">
              <h6 className="dashRec text-lg font-bold text-gray-700 mb-3">People you might know</h6>
              {suggestedConnections?.map((user, index) => (
                <div
                  key={user._id || index}
                  className="flex items-center p-2 text-gray-600 hover:bg-amber-50 cursor-pointer rounded-lg transition-colors"
                >
                  <ProfileComponent user={user} />
                  <div className="center h-10 w-50">
                    <button className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-amber-600 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              ))}
              {(!suggestedConnections || suggestedConnections.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Grow your network to see suggestions
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
