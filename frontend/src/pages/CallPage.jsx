import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import { 
  ArrowLeft, 
  Minimize2, 
  Maximize2, 
  Wifi, 
  WifiOff,
  Users,
  Clock,
  AlertCircle
} from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const clientRef = useRef(null);
  const callRef = useRef(null);
  const connectionInProgress = useRef(false);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let callInstance;
    let videoClient;

    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId || connectionInProgress.current) return;

      connectionInProgress.current = true;

      try {
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        // Use getOrCreateInstance to reuse existing client if available
        videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        // Ensure client is connected with the correct user
        // Check internal state to avoid "Consecutive calls" error
        const isConnected = videoClient.ws?.isConnectionEstablished;
        const isConnecting = videoClient.ws?.isConnecting;
        
        if (!isConnected && !isConnecting) {
             // Only connect if totally disconnected
             if (videoClient.userID && videoClient.userID !== user.id) {
                 await videoClient.disconnectUser();
             }
             if (!videoClient.userID || videoClient.userID !== user.id) {
                await videoClient.connectUser(user, tokenData.token);
             }
        }

        callInstance = videoClient.call("default", callId);
        
        // Check expiration...
        try {
            await callInstance.get();
            const createdAt = callInstance.state.createdAt;
            const participantCount = callInstance.state.participantCount;
            if (createdAt && new Date(createdAt) < new Date(Date.now() - 60 * 60 * 1000) && participantCount === 0) {
                 toast.error("This call link has expired.");
                 setIsConnecting(false);
                 connectionInProgress.current = false;
                 return;
            }
        } catch (err) {
             // New call
        }

        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
        setIsConnecting(false);
      } catch (error) {
        console.error("Error joining call:", error);
        if (error.name === 'NotReadableError' || error.message?.includes('Device in use')) {
            toast.error("Camera/Mic is busy. Close other apps using them.");
        } else {
            toast.error("Failed to join call");
        }
        setIsConnecting(false);
      } finally {
        connectionInProgress.current = false;
      }
    };

    initCall();

    return () => {
      const cleanup = async () => {
        if (callInstance) {
          try {
            await callInstance.leave();
          } catch (e) {
            console.error("Error leaving call:", e);
          }
        }
        
        // Removed strict disconnect to prevent "Consecutive calls" error
        // The StreamVideoClient singleton should maintain the user connection
        
        setCall(null);
        setClient(null);
      };
      cleanup();
    };
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white gap-6 px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl blur-2xl opacity-40 animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm border border-red-500/30 shadow-2xl">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>
          
          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Unable to Connect
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We couldn't establish a connection to the call. Please check your internet connection and try again.
            </p>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
          >
            <span className="relative z-10">Retry Connection</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </button>
        </div>
      )}
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState("excellent");

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      setTimeout(() => navigate("/"), 100);
    }
  }, [callingState, navigate]);

  // Call duration timer
  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callingState]);

  // Simulate connection quality (you can replace with actual quality metrics)
  useEffect(() => {
    const qualities = ["excellent", "good", "fair", "poor"];
    const interval = setInterval(() => {
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityConfig = (quality) => {
    const configs = {
      excellent: {
        color: "emerald",
        icon: <Wifi className="w-3.5 h-3.5" />,
        bars: 4,
        label: "Excellent"
      },
      good: {
        color: "green",
        icon: <Wifi className="w-3.5 h-3.5" />,
        bars: 3,
        label: "Good"
      },
      fair: {
        color: "yellow",
        icon: <Wifi className="w-3.5 h-3.5" />,
        bars: 2,
        label: "Fair"
      },
      poor: {
        color: "red",
        icon: <WifiOff className="w-3.5 h-3.5" />,
        bars: 1,
        label: "Poor"
      }
    };
    return configs[quality] || configs.good;
  };

  const qualityConfig = getQualityConfig(connectionQuality);

  if (callingState === CallingState.LEFT) {
    return null;
  }

  return (
    <StreamTheme className="w-full h-full flex flex-col relative">
      {/* Top Bar with Glass Effect */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-md">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
            {/* Left: Back Button */}
            <button 
              onClick={() => navigate("/")}
              className="group h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 flex items-center justify-center ring-1 ring-white/20 hover:ring-white/40 hover:shadow-lg hover:shadow-white/20"
              title="Leave call"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Center: Call Status */}
            <div className="flex items-center gap-3 flex-1 justify-center">
              {/* Live Indicator */}
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 backdrop-blur-sm shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-white text-sm font-semibold">LIVE</span>
                </div>
              </div>

              {/* Call Duration */}
              <div className="hidden sm:flex px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-300" />
                  <span className="text-white text-sm font-medium tabular-nums">
                    {formatDuration(callDuration)}
                  </span>
                </div>
              </div>

              {/* Participants Count (Optional) */}
              <div className="hidden md:flex px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-300" />
                  <span className="text-white text-sm font-medium">2</span>
                </div>
              </div>
            </div>

            {/* Right: Fullscreen Toggle */}
            <button 
              onClick={toggleFullscreen}
              className="group h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 flex items-center justify-center ring-1 ring-white/20 hover:ring-white/40 hover:shadow-lg hover:shadow-white/20"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Video Layout */}
      <div className="flex-1 relative w-full h-full">
        <SpeakerLayout />
      </div>
      
      {/* Bottom Controls Bar with Glass Effect */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent backdrop-blur-md">
        <div className="px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto">
            <CallControls onLeave={() => navigate("/")} />
          </div>
        </div>
      </div>

      {/* Connection Quality Indicator - Top Right */}
      <div className="absolute top-20 right-4 sm:right-6 z-20 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className={`px-3.5 py-2 rounded-2xl bg-${qualityConfig.color}-500/10 backdrop-blur-md border border-${qualityConfig.color}-500/30 shadow-lg`}>
          <div className="flex items-center gap-2.5">
            {/* Signal Bars */}
            <div className="flex gap-0.5 items-end">
              {[...Array(4)].map((_, i) => (
                <span 
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    i < qualityConfig.bars 
                      ? `bg-${qualityConfig.color}-400 h-${i + 2}` 
                      : 'bg-slate-600 h-2'
                  }`}
                  style={{
                    height: i < qualityConfig.bars 
                      ? `${(i + 1) * 4}px` 
                      : '4px'
                  }}
                />
              ))}
            </div>
            <span className={`text-${qualityConfig.color}-400 text-xs font-semibold`}>
              {qualityConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Call Duration (Shows on small screens) */}
      <div className="sm:hidden absolute top-20 left-4 z-20 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-white text-xs font-medium tabular-nums">
              {formatDuration(callDuration)}
            </span>
          </div>
        </div>
      </div>

      {/* Ambient light effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>
    </StreamTheme>
  );
};

export default CallPage;