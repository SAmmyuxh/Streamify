import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon, UserIcon, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/friends", icon: UsersIcon, label: "Friends" },
    { path: "/notifications", icon: BellIcon, label: "Notifications" },
    { path: "/profile", icon: UserIcon, label: "Profile" },
  ];

  return (
    <aside className={`
      ${isCollapsed ? 'w-20' : 'w-64'} 
      bg-gradient-to-b from-base-200 to-base-100 border-r border-base-300/50 
      hidden lg:flex flex-col h-screen sticky top-0 shadow-xl
      transition-all duration-300 ease-in-out
    `}>
      {/* Logo Section with Enhanced Styling */}
      <div className="p-6 border-b border-base-300/30 bg-base-200/50 backdrop-blur-sm relative">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <ShipWheelIcon className="size-10 text-primary drop-shadow-lg group-hover:rotate-180 transition-transform duration-700" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-2xl font-bold text-primary tracking-tight whitespace-nowrap">
                Streamify
              </span>
              <span className="text-[10px] text-base-content/50 tracking-widest uppercase whitespace-nowrap">
                Connect & Chat
              </span>
            </div>
          )}
        </Link>
        
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 group"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4 text-primary-content" />
          ) : (
            <ChevronLeft className="size-4 text-primary-content" />
          )}
        </button>
      </div>

      {/* Navigation Links with Enhanced Animations */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = currentPath === path;
          return (
            <Link
              key={path}
              to={path}
              className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-300 ease-out
                ${isActive 
                  ? "bg-primary text-primary-content shadow-lg shadow-primary/30 scale-[1.02]" 
                  : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content"
                }
                ${isCollapsed ? 'justify-center' : 'hover:pl-6'}
              `}
              title={isCollapsed ? label : ''}
            >
              {/* Active Indicator */}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-content rounded-r-full" />
              )}
              
              {/* Icon with Animation */}
              <Icon className={`
                size-5 transition-all duration-300 flex-shrink-0
                ${isActive ? "scale-110" : "group-hover:scale-110"}
              `} />
              
              {/* Label */}
              {!isCollapsed && (
                <span className="font-medium text-sm tracking-wide whitespace-nowrap">
                  {label}
                </span>
              )}

              {/* Hover Effect Background */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section - Enhanced */}
      <div className="p-4 border-t border-base-300/30 mt-auto bg-base-200/30 backdrop-blur-sm">
        <Link 
          to="/profile" 
          className={`
            flex items-center gap-3 hover:bg-base-300/30 p-3 rounded-xl 
            transition-all duration-300 group relative overflow-hidden
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? authUser?.fullName : ''}
        >
          {/* Animated Background on Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 bg-[length:200%] opacity-0 group-hover:opacity-100 group-hover:animate-gradient transition-opacity" />
          
          {/* Avatar with Ring and Glow */}
          <div className="relative z-10 flex-shrink-0">
            <div className="avatar">
              <div className="w-11 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-base-200 group-hover:ring-primary/60 transition-all duration-300">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            {/* Online Status Indicator */}
            <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-success ring-2 ring-base-200 animate-pulse" />
          </div>
          
          {/* User Info */}
          {!isCollapsed && (
            <div className="flex-1 relative z-10 min-w-0">
              <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {authUser?.fullName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-success">
                <Sparkles className="size-3 animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          )}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-50 min-w-max">
              <p className="font-semibold">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <Sparkles className="size-3" />
                Online
              </p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;