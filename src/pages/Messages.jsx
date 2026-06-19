import React, { useEffect, useRef, useState } from "react";
import { useMessagesStore } from "../Store/messagesStore";
import { useAuthStore } from "../Store/AuthStore";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPhone } from "react-icons/fa";
import SnapchatThread from "../skeletons/ProfileCardSkeleton";
import notP from "./user.jpg";
import {
  ProfileComponentMessage,
  ProfileComponentMessageHeader,
} from "../components/profileCard";
import "../coustomStyles/container.css";
import "../coustomStyles/messages.css";
import MessageInput from "../components/MessageInput";

const SideBarUsersPFP = ({ sideBarUsers, setSelectedUser, onlineUsers }) => {
  if (!sideBarUsers || sideBarUsers.length === 0) return <p>No users available</p>;

  return (
    <>
      {sideBarUsers.map((user, i) => (
        <div className="p-0" key={user._id || i}>
          <button
            className="proBtn focus:ring-0"
            onClick={() => {
              setSelectedUser(user);
            }}
          >
            <ProfileComponentMessage sideUser={user} onlineUsers={onlineUsers} />
          </button>
        </div>
      ))}
    </>
  );
};

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currUser, onlineUsers } = useAuthStore();
  const [sideBarUsers4, setSideBarUsers4] = useState([]);
  const messageEndRef = useRef(null);

  const {
    selectedUser,
    setSelectedUser,
    getSideBarUsers,
    sideBarUsers,
    sideBarUsersLoading,
    messages,
    error,
    getMessages,
    setSideBarUsers,
    messagesLoading,
    sendMessage,
    sendMessageLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useMessagesStore();

  useEffect(() => {
    getSideBarUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser]);

  useEffect(() => {
    if (sideBarUsers) {
      setSideBarUsers4(sideBarUsers);
    }
  }, [sideBarUsers]);

  useEffect(() => {
    if (location.state?.newUser) {
      const newUser = location.state.newUser;

      setSideBarUsers4((prevUsers) => {
        if (!Array.isArray(prevUsers)) return [newUser];

        if (!prevUsers.some((user) => user._id === newUser._id)) {
          return [...prevUsers, newUser];
        }
        return prevUsers;
      });
    }
  }, [location.state]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  

  if (error) {
    return <div>Error loading sidebar users.</div>;
  }

  return (
    <div className="dashCon">
      <div className="dashConItem">
        <div className="item1">
          <main className="mBox">
            <div className="mLeft">
              <div className="mll flex flex-col gap-2">
                <div className="mllHead">
                  <h1>Profiles</h1>
                </div>
                <div className="mllBase">
                  {sideBarUsersLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div className="p-0" key={i}>
                        <button className="proBtn focus:ring-0">
                          <SnapchatThread />
                        </button>
                      </div>
                    ))
                  ) : sideBarUsers4.length > 0 ? (
                    <SideBarUsersPFP
                      sideBarUsers={sideBarUsers4}
                      setSelectedUser={setSelectedUser}
                      onlineUsers={onlineUsers}
                    />
                  ) : (
                    <div className="w-full h-2/3 center"> No chats yet</div>
                  )}
                </div>
              </div>

              <div className="mlr flex flex-col gap-2">
                <div className="mlrHead flex justify-between items-center">
                  <ProfileComponentMessageHeader selectedUser={selectedUser} onlineUsers={onlineUsers} />
                  <FaPhone className="h-6 w-6" />
                </div>

                <div className="mlrBase">
                  {messagesLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div className="p-0" key={i}>
                        <button className="proBtn focus:ring-0">
                          <SnapchatThread />
                        </button>
                      </div>
                    ))
                  ) : !selectedUser ? (
                    <div className="w-full h-2/3 center">Select a user to start chatting</div>
                  ) : messages?.length === 0 ? (
                    <div className="w-full h-2/3 center">No messages yet</div>
                  ) : (
                    <div className="messages-container">
                      {messages.map((item, i) => {
                        const isSharedPost = item.text?.startsWith("[SHARED_POST]:");
                        let sharedPost = null;
                        if (isSharedPost) {
                          try {
                            sharedPost = JSON.parse(item.text.slice(14));
                          } catch (e) {
                            console.error("Failed to parse shared post:", e);
                          }
                        }

                        return (
                          <div
                            className={`w-full flex pad2 ${
                              item.senderId === currUser._id ? "justify-end" : "justify-start"
                            }`}
                            key={i}
                          >
                            {isSharedPost && sharedPost ? (
                              <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-2xl shadow-lg border text-left transition-transform hover:scale-[1.01] ${
                                  item.senderId === currUser._id
                                    ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-gray-800"
                                    : "bg-white border-gray-200 text-gray-800"
                                }`}
                              >
                                <div className="text-[11px] text-amber-600 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                  <span>Shared Post</span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                  <img
                                    src={sharedPost.authorPic || notP}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
                                  />
                                  <span className="font-semibold text-xs text-gray-700">
                                    {sharedPost.authorName}
                                  </span>
                                </div>
                                {sharedPost.text && (
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                                    {sharedPost.text}
                                  </p>
                                )}
                                {sharedPost.image && (
                                  <div className="relative rounded-xl overflow-hidden mb-3 border border-gray-100 bg-gray-50">
                                    <img
                                      src={sharedPost.image}
                                      alt="Shared content"
                                      className="w-full max-h-48 object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                <button
                                  onClick={() => navigate("/home")}
                                  className="w-full text-center py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
                                >
                                  View Post Feed
                                </button>
                              </div>
                            ) : (
                              <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm border ${
                                  item.senderId === currUser._id
                                    ? "bg-amber-500 text-white border-amber-600 rounded-br-none"
                                    : "bg-gray-100 text-gray-800 border-gray-200 rounded-bl-none"
                                }`}
                              >
                                {item.image && (
                                  <div className="rounded-lg overflow-hidden mb-2 max-w-full">
                                    <img
                                      src={item.image}
                                      alt="Attachment"
                                      className="max-h-60 object-cover w-full rounded-lg"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                {item.text && <p className="break-words leading-relaxed text-sm">{item.text}</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messageEndRef} />
                    </div>
                  )}
                </div>
                {selectedUser && <MessageInput />}
              </div>
            </div>
            <div className="mRight"></div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Messages;
