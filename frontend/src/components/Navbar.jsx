import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon, Flame, Trophy, Bot, Globe, Mic, Menu } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = ({ onMobileMenuToggle }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-100/80 backdrop-blur-xl border-b border-base-300/50 sticky top-0 z-30 h-16 flex items-center shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Mobile Menu Button */}
          <button 
            className="btn btn-ghost btn-circle lg:hidden mr-2"
            onClick={onMobileMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>

          {/* LOGO - Enhanced for Chat Page */}
          {isChatPage && (
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <ShipWheelIcon className="size-9 text-primary drop-shadow-lg group-hover:rotate-180 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-primary tracking-tight">
                    Streamify
                  </span>
                  <span className="text-[9px] text-base-content/50 tracking-wider uppercase">
                    Connect & Chat
                  </span>
                </div>
              </Link>
            </div>
          )}

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Streak Indicator */}
            <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 mr-2">
              <Flame className={`size-4 ${authUser?.streak > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-base-content/40"}`} />
              <span className={`text-sm font-bold ${authUser?.streak > 0 ? "text-orange-600" : "text-base-content/60"}`}>
                {authUser?.streak || 0}
              </span>
            </div>

            {/* Leaderboard Button */}
            <Link to="/leaderboard">
              <button className="btn btn-ghost btn-circle relative group hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <Trophy className="h-5 w-5" />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>

            {/* Map Button */}
            <Link to="/map">
              <button className="btn btn-ghost btn-circle relative group hover:bg-accent/10 hover:text-accent transition-all duration-300">
                <Globe className="h-5 w-5" />
                <div className="absolute inset-0 rounded-full bg-accent/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>

            {/* Voice Lab Button */}
            <Link to="/voice-lab">
              <button className="btn btn-ghost btn-circle relative group hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <Mic className="h-5 w-5" />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>

            {/* AI Tutor Button */}
            <Link to="/ai-tutor">
              <button className="btn btn-ghost btn-circle relative group hover:bg-secondary/10 hover:text-secondary transition-all duration-300">
                <Bot className="h-5 w-5" />
                <div className="absolute inset-0 rounded-full bg-secondary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>

            {/* Notifications Button */}
            <Link to="/notifications">
              <button className="btn btn-ghost btn-circle relative group hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <BellIcon className="h-5 w-5" />
                {/* Notification Badge */}
                <span className="absolute top-2 right-2 size-2 bg-error rounded-full ring-2 ring-base-100 animate-pulse" />
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>

            {/* Theme Selector */}
            <div className="relative">
              <ThemeSelector />
            </div>

            {/* User Avatar with Enhanced Styling */}
            <Link to="/profile" className="relative group">
              <div className="avatar">
                <div className="w-9 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100 group-hover:ring-primary/60 transition-all duration-300 group-hover:scale-110">
                  <img src={authUser?.profilePic} alt="User Avatar" />
                </div>
              </div>
              {/* Online Status */}
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success ring-2 ring-base-100" />
              {/* Hover Tooltip */}
              <div className="absolute -bottom-10 right-0 bg-base-300 text-base-content text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg">
                {authUser?.fullName}
              </div>
            </Link>

            {/* Logout Button with Confirmation */}
            <button 
              className="btn btn-ghost btn-circle group hover:bg-error/10 hover:text-error transition-all duration-300 relative"
              onClick={logoutMutation}
            >
              <LogOutIcon className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-full bg-error/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Hover Tooltip */}
              <div className="absolute -bottom-10 right-0 bg-base-300 text-base-content text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg">
                Logout
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;