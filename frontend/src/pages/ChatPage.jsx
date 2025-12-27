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
import { ArrowLeft, Video, Phone, MoreVertical, Search, Trash2, Info } from "lucide-react";

import ChatLoader from "../components/ChatLoader";
import CustomMessage from "../components/chat/CustomMessage";

import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Modern Custom Header with gradient and glass effects
const CustomChannelHeader = ({ onVideoCall }) => {
  const { channel, watchers } = useChannelStateContext();
  const { client } = useChatContext();
  const [otherUser, setOtherUser] = useState(null);
  
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
      <div className="h-20 border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl flex items-center px-6 shadow-lg">
        <div className="w-full flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 animate-pulse shadow-xl" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-36 bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse rounded-lg" />
            <div className="h-3 w-24 bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-20 border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl flex items-center px-4 sm:px-6 sticky top-0 z-20 shadow-lg">
      <div className="w-full flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link 
            to="/" 
            className="group p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <ArrowLeft className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors" />
          </Link>
          
          <div className="relative flex-shrink-0">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <img 
                src={otherUser.image || "/avatar.png"} 
                className="relative h-14 w-14 rounded-2xl object-cover ring-2 ring-white/20 shadow-xl hover:ring-white/40 transition-all duration-300" 
                alt={otherUser.name} 
              />
              {isOnline && (
                <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full ring-4 ring-slate-900 shadow-lg">
                  <span className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col min-w-0">
            <h2 className="font-semibold text-lg text-white truncate tracking-tight">{otherUser.name}</h2>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">
                    Active now
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Offline</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            className="group p-2.5 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
            onClick={onVideoCall}
            title="Start video call"
          >
            <Video className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors" />
          </button>
          
          <button
            className="group p-2.5 hover:bg-gradient-to-br hover:from-emerald-600 hover:to-emerald-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30"
            title="Start voice call"
          >
            <Phone className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors" />
          </button>
          
          <div className="dropdown dropdown-end">
            <button 
              tabIndex={0} 
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300"
            >
              <MoreVertical className="h-5 w-5 text-slate-300" />
            </button>
            <ul 
              tabIndex={0} 
              className="dropdown-content z-[1] menu p-2 shadow-2xl bg-slate-800/95 backdrop-blur-xl rounded-2xl w-56 border border-white/10 mt-2"
            >
              <li>
                <button className="flex items-center gap-3 text-slate-200 hover:bg-white/10 rounded-xl py-2.5 px-3 transition-all duration-200">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Search in chat</span>
                </button>
              </li>
              <li>
                <button className="flex items-center gap-3 text-slate-200 hover:bg-white/10 rounded-xl py-2.5 px-3 transition-all duration-200">
                  <Info className="h-4 w-4" />
                  <span className="text-sm">Chat info</span>
                </button>
              </li>
              <div className="divider my-1 opacity-20"></div>
              <li>
                <button className="flex items-center gap-3 text-red-400 hover:bg-red-500/10 rounded-xl py-2.5 px-3 transition-all duration-200">
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Delete chat</span>
                </button>
              </li>
            </ul>
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

        await ensureStreamUser(targetUserIdStr).catch(err => console.warn("Ensure user check:", err));
        
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
        // Generate a unique call ID to prevent reusing the same link
        const callId = crypto.randomUUID();
        
        // 1. Notify the backend so global notification works
        const members = Object.values(channel.state.members);
        const otherMember = members.find(m => m.user.id !== chatClient.userID);
        
        if (otherMember) {
             await axiosInstance.post("/notifications/send-call-invite", {
                recipientId: otherMember.user.id,
                callId: callId
             });
        }

        // 2. Send the chat message with the invite card
        await channel.sendMessage({
          text: "", 
          attachments: [
            {
              type: "call_invite",
              call_id: callId,
              title: "Video Call Invitation",
            }
          ]
        });

        // 3. Navigate to the call
        navigate(`/call/${callId}`);
        
      } catch (error) {
        console.error("Error starting call:", error);
        toast.error("Failed to start video call");
        setIsCalling(false);
      }
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 h-full flex flex-col">
        <Chat client={chatClient} theme="str-chat__theme-dark">
          <Channel channel={channel}>
            <Window>
              <CustomChannelHeader onVideoCall={handleVideoCall} />
              <MessageList Message={CustomMessage} />
              <MessageInput /> 
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;