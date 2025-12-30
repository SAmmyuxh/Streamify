import { useLocation } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Toaster, toast } from "react-hot-toast";
import GlassBackground from "./GlassBackground";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../lib/api";
import { useEffect, useRef, useState } from "react";
import { Video } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup", "/onboarding"];
  const hideSidebarRoutes = ["/login", "/signup", "/onboarding"];
  const isAuthPage = hideNavbarRoutes.includes(location.pathname);
  const isChatPage = location.pathname?.startsWith("/chat");
  const isCallPage = location.pathname?.startsWith("/call");
  
  const showNavbar = !isAuthPage && !isCallPage;
  const showSidebar = !isAuthPage && !isChatPage && !isCallPage;
  
  // Only get authUser on non-auth pages to avoid unnecessary requests
  const { authUser } = useAuthUser();
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Only fetch notifications when user is authenticated AND not on auth pages
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 3000, // Poll every 3s
    enabled: !!authUser && !isAuthPage,
  });

  const lastProcessedCallRef = useRef(null);

  useEffect(() => {
    try {
        if (!notifications || !Array.isArray(notifications)) return;

        // Find a call invite from the last 15 seconds
        const recentInvite = notifications.find(n => 
          n.type === "call_invite" && 
          n.createdAt &&
          new Date(n.createdAt) > new Date(Date.now() - 15000) 
        );

        if (recentInvite && recentInvite._id !== lastProcessedCallRef.current) {
          lastProcessedCallRef.current = recentInvite._id;
          const callId = recentInvite.metadata?.callId;
          
          if (callId && recentInvite.sender) {
              toast((t) => (
                <div className="flex flex-col gap-2 min-w-[250px]">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <Video className="size-5 text-primary animate-pulse" />
                    Incoming Video Call
                  </div>
                  <p className="text-sm opacity-80">
                    {recentInvite.sender?.fullName || "Someone"} is calling you...
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Link 
                      to={`/call/${callId}`}
                      className="btn btn-primary btn-sm flex-1"
                      onClick={() => toast.dismiss(t.id)}
                    >
                      Accept
                    </Link>
                     <button 
                      className="btn btn-ghost btn-sm flex-1"
                      onClick={() => toast.dismiss(t.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ), { duration: 10000, icon: null });
          }
        }
    } catch (error) {
        console.error("Error processing notifications:", error);
    }
  }, [notifications]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Animation - Hide on auth pages */}
      {!isAuthPage && (
        <>
          <GlassBackground />
          
          {/* Animated Gradient Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-0 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </div>
        </>
      )}

      {/* Custom Toast Styling */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937', // Solid dark gray background
            color: '#f9fafb',
            border: '1px solid #374151',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
            fontWeight: '500',
          },
          success: {
            style: {
              background: '#065f46', // Solid green background
              color: '#ecfdf5',
              border: '1px solid #10b981',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
          error: {
            style: {
              background: '#7f1d1d', // Solid red background
              color: '#fef2f2',
              border: '1px solid #ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />

      <div className="flex h-screen overflow-hidden relative z-10">
        {/* Sidebar with Slide-in Animation */}
        {showSidebar && (
          <div className="animate-slide-in-left relative z-50">
            <Sidebar 
              isMobileOpen={isMobileSidebarOpen} 
              onMobileClose={() => setIsMobileSidebarOpen(false)} 
            />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar with Slide-down Animation */}
          {showNavbar && (
            <div className="animate-slide-in-down">
              <Navbar onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />
            </div>
          )}

          {/* Main Content Area with Enhanced Styling */}
          <main 
            className={`
              flex-1 overflow-y-auto relative
              ${isChatPage ? "p-0" : "p-4 sm:p-6"}
              scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent
            `}
          >
            {/* Content Fade-in Animation */}
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;