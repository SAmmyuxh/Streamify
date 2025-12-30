import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, ensureStreamUser } from "../lib/api";
import { axiosInstance } from "../lib/axios";
import {
  Channel,
  Chat,
  MessageList,
  MessageInput,
  Thread,
  Window,
  useChannelStateContext,
  useChatContext,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Search,
  Trash2,
  Info,
  X,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  Clock,
  User,
} from "lucide-react";
import ChatLoader from "../components/ChatLoader";
import CustomMessage from "../components/chat/CustomMessage";
import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Search Modal Component
const SearchModal = ({ isOpen, onClose, channel }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search through local channel messages
      const messages = channel?.state?.messages || [];
      const lowerQuery = query.toLowerCase();
      
      const filteredMessages = messages.filter(msg => 
        msg.text && msg.text.toLowerCase().includes(lowerQuery)
      ).map(msg => ({ message: msg }));
      
      setSearchResults(filteredMessages);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((result) => (
                <div
                  key={result.message.id}
                  className="p-3 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={result.message.user?.image || "/avatar.png"}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {result.message.user?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2">
                    {result.message.text}
                  </p>
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="p-8 text-center text-muted-foreground">
              No messages found
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Chat Info Modal Component
const ChatInfoModal = ({ isOpen, onClose, otherUser, channel }) => {
  const [messageCount, setMessageCount] = useState(0);
  const [imageCount, setImageCount] = useState(0);

  useEffect(() => {
    if (channel && isOpen) {
      // Count messages and images
      const messages = channel.state.messages || [];
      setMessageCount(messages.length);
      setImageCount(
        messages.filter((m) =>
          m.attachments?.some((a) => a.type === "image")
        ).length
      );
    }
  }, [channel, isOpen]);

  if (!isOpen || !otherUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg text-foreground">Chat Info</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 flex flex-col items-center text-center border-b border-border">
          <img
            src={otherUser.image || "/avatar.png"}
            alt={otherUser.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-xl mb-4"
          />
          <h4 className="text-xl font-semibold text-foreground">{otherUser.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {otherUser.online ? "🟢 Online" : "⚫ Offline"}
          </p>
        </div>

        {/* Stats Section */}
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{messageCount}</p>
            <p className="text-xs text-muted-foreground">Messages</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{imageCount}</p>
            <p className="text-xs text-muted-foreground">Images</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>User ID: {otherUser.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Delete Chat?</h3>
          <p className="text-sm text-muted-foreground mb-6">
            This will permanently delete all messages in this conversation. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-border hover:bg-muted transition-colors text-foreground font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-destructive hover:bg-destructive/90 transition-colors text-white font-medium flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Custom Header with premium design
const CustomChannelHeader = ({ onVideoCall, onVoiceCall, onSearch, onInfo, onDelete }) => {
  const { channel, watchers } = useChannelStateContext();
  const { client } = useChatContext();
  const [otherUser, setOtherUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (channel && channel.state?.members) {
      const members = Object.values(channel.state.members);
      const otherMember = members.find(
        (member) => member.user?.id !== client.userID
      );
      if (otherMember?.user) {
        setOtherUser(otherMember.user);
      }
    }
  }, [channel, client.userID]);

  const isOnline = watchers && watchers[otherUser?.id] ? true : false;

  if (!otherUser) {
    return (
      <div className="h-16 sm:h-20 border-b border-border/50 bg-gradient-to-b from-background via-background to-muted/20 backdrop-blur-xl">
        <div className="h-full animate-pulse flex items-center px-4 sm:px-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full"></div>
          <div className="ml-3 sm:ml-4 flex-1">
            <div className="h-4 bg-muted rounded w-32 mb-2"></div>
            <div className="h-3 bg-muted rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleMenuAction = (action) => {
    setShowMenu(false);
    action();
  };

  return (
    <div className="relative h-16 sm:h-20 border-b border-border/50 bg-gradient-to-b from-background via-background to-muted/20 backdrop-blur-xl shadow-sm z-[100]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
      
      <div className="relative h-full flex items-center justify-between px-4 sm:px-6">
        {/* Left section - Back button + User info */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Link
            to="/"
            className="p-2 hover:bg-muted/60 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </Link>

          {/* User avatar with online indicator */}
          <div className="relative flex-shrink-0">
            <img
              src={otherUser.image || "/avatar.png"}
              alt={otherUser.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-background shadow-lg ring-2 ring-primary/10 transition-all duration-200 hover:ring-primary/30"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-background shadow-lg">
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
              </div>
            )}
          </div>

          {/* User name and status */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base sm:text-lg text-foreground truncate">
              {otherUser.name}
            </h2>
            {isOnline ? (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-green-600 dark:text-green-400">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="font-medium">Active now</span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">Offline</p>
            )}
          </div>
        </div>

        {/* Right section - Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Video call button */}
          <button
            onClick={onVideoCall}
            className="p-2 sm:p-2.5 hover:bg-primary/10 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 group"
            title="Start video call"
          >
            <Video className="w-5 h-5 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          {/* Phone call button */}
          <button
            onClick={onVoiceCall}
            className="p-2 sm:p-2.5 hover:bg-primary/10 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 group"
            title="Start voice call"
          >
            <Phone className="w-5 h-5 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 sm:p-2.5 hover:bg-muted/60 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              title="More options"
            >
              <MoreVertical className="w-5 h-5 sm:w-5 sm:h-5 text-muted-foreground" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1f2937] border border-gray-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="py-1.5">
                    <button 
                      onClick={() => handleMenuAction(onSearch)}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-200"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span>Search in chat</span>
                    </button>
                    <button 
                      onClick={() => handleMenuAction(onInfo)}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-200"
                    >
                      <Info className="w-4 h-4 text-gray-400" />
                      <span>Chat info</span>
                    </button>
                    <div className="h-px bg-gray-600 my-1.5"></div>
                    <button 
                      onClick={() => handleMenuAction(onDelete)}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-900/50 transition-colors flex items-center gap-3 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete chat</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  // Modal states
  const [showSearch, setShowSearch] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [otherUserInfo, setOtherUserInfo] = useState(null);

  const { authUser, isLoading: authUserLoading } = useAuthUser();

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser && !authUserLoading,
    retry: 2,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !targetUserId) {
        if (tokenLoading) return;
        return;
      }

      try {
        setError(null);
        setLoading(true);

        let client = StreamChat.getInstance(STREAM_API_KEY);
        if (client.userID) {
          await client.disconnectUser();
        }

        const userId = authUser._id.toString();
        const targetUserIdStr = targetUserId.toString();

        await ensureStreamUser(targetUserIdStr).catch((err) =>
          console.warn("Ensure user check:", err)
        );

        await client.connectUser(
          {
            id: userId,
            name: authUser.fullName || "User",
            image: authUser.profilePic,
          },
          tokenData.token
        );

        clientRef.current = client;

        const channelId = [userId, targetUserIdStr].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [userId, targetUserIdStr],
        });

        await currChannel.watch({ presence: true });

        // Get other user info for modals
        const members = Object.values(currChannel.state.members);
        const otherMember = members.find((m) => m.user_id !== userId);
        if (otherMember?.user) {
          setOtherUserInfo(otherMember.user);
        }

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setError("Could not connect to chat.");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (clientRef.current) clientRef.current.disconnectUser();
    };
  }, [tokenData, authUser, targetUserId, tokenLoading]);

  const [isCalling, setIsCalling] = useState(false);

  const handleVideoCall = async () => {
    if (isCalling) return;

    if (channel) {
      try {
        setIsCalling(true);
        const callId = crypto.randomUUID();

        const members = Object.values(channel.state.members);
        const otherMember = members.find((m) => m.user.id !== chatClient.userID);

        if (otherMember) {
          await axiosInstance.post("/notifications/send-call-invite", {
            recipientId: otherMember.user.id,
            callId: callId,
          });
        }

        await channel.sendMessage({
          text: "",
          attachments: [
            {
              type: "call_invite",
              call_id: callId,
              title: "Video Call Invitation",
            },
          ],
        });

        navigate(`/call/${callId}`);
      } catch (error) {
        console.error("Error starting call:", error);
        toast.error("Failed to start video call");
        setIsCalling(false);
      }
    }
  };

  const handleVoiceCall = async () => {
    if (isCalling) return;

    if (channel) {
      try {
        setIsCalling(true);
        const callId = crypto.randomUUID();

        const members = Object.values(channel.state.members);
        const otherMember = members.find((m) => m.user.id !== chatClient.userID);

        if (otherMember) {
          await axiosInstance.post("/notifications/send-call-invite", {
            recipientId: otherMember.user.id,
            callId: callId,
          });
        }

        await channel.sendMessage({
          text: "",
          attachments: [
            {
              type: "call_invite",
              call_id: callId,
              title: "Voice Call Invitation",
            },
          ],
        });

        // Navigate to call page with audio-only mode
        navigate(`/call/${callId}?audio=true`);
      } catch (error) {
        console.error("Error starting voice call:", error);
        toast.error("Failed to start voice call");
        setIsCalling(false);
      }
    }
  };

  const handleDeleteChat = async () => {
    if (!channel) return;

    try {
      setIsDeleting(true);
      await channel.delete();
      toast.success("Chat deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      {/* Premium ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Chat interface with all components */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
        <Chat client={chatClient} theme="str-chat__theme-light">
          <Channel channel={channel} Message={CustomMessage}>
            <Window>
              {/* Custom Header - must be inside Window */}
              <CustomChannelHeader 
                onVideoCall={handleVideoCall} 
                onVoiceCall={handleVoiceCall}
                onSearch={() => setShowSearch(true)}
                onInfo={() => setShowChatInfo(true)}
                onDelete={() => setShowDeleteConfirm(true)}
              />
              
              {/* Message List */}
              <MessageList />
              
              {/* Message Input */}
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>

      {/* Modals */}
      <SearchModal 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
        channel={channel}
      />
      <ChatInfoModal 
        isOpen={showChatInfo} 
        onClose={() => setShowChatInfo(false)} 
        otherUser={otherUserInfo}
        channel={channel}
      />
      <DeleteConfirmModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={handleDeleteChat}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ChatPage;