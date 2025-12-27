import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { MessageSquareIcon, MapPinIcon, SparklesIcon } from "lucide-react";
import { motion } from "framer-motion";

const FriendCard = ({ friend, index = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      {/* Animated Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      {/* Main Card */}
      <div className="relative glass-card rounded-3xl overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl">
        {/* Decorative Top Bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        
        <div className="p-6">
          {/* USER INFO */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {/* Avatar Glow */}
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-md group-hover:bg-primary/50 transition-all" />
              
              {/* Avatar */}
              <div className="avatar size-16 relative">
                <img 
                  src={friend.profilePic} 
                  alt={friend.fullName}
                  className="rounded-full ring-4 ring-base-100 group-hover:ring-primary/50 transition-all group-hover:scale-110 transform duration-300"
                />
              </div>
              
              {/* Online Status Indicator */}
              <span className="absolute bottom-1 right-1 size-4 bg-success rounded-full ring-2 ring-base-100 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                {friend.fullName}
              </h3>
              {friend.location && (
                <p className="text-sm text-base-content/60 flex items-center gap-1.5 mt-1">
                  <MapPinIcon className="size-3.5" />
                  {friend.location}
                </p>
              )}
            </div>
          </div>

          {/* LANGUAGE BADGES */}
          <div className="space-y-2 mb-4">
            {/* Native Language */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-3 rounded-xl border border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-2">
                <span className="text-xs text-base-content/60 font-medium uppercase tracking-wider">Native</span>
                <div className="flex-1 h-px bg-primary/20" />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {getLanguageFlag(friend.nativeLanguage)}
                <span className="font-semibold text-primary text-sm">
                  {friend.nativeLanguage}
                </span>
              </div>
            </div>

            {/* Learning Language */}
            <div className="bg-gradient-to-r from-secondary/20 to-secondary/5 p-3 rounded-xl border border-secondary/20 hover:border-secondary/40 transition-all">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-3 text-secondary" />
                <span className="text-xs text-base-content/60 font-medium uppercase tracking-wider">Learning</span>
                <div className="flex-1 h-px bg-secondary/20" />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {getLanguageFlag(friend.learningLanguage)}
                <span className="font-semibold text-secondary text-sm">
                  {friend.learningLanguage}
                </span>
              </div>
            </div>
          </div>

          {/* Bio Preview */}
          {friend.bio && (
            <p className="text-sm text-base-content/70 line-clamp-2 mb-4 p-3 bg-base-200/30 rounded-xl italic">
              "{friend.bio}"
            </p>
          )}

          {/* MESSAGE BUTTON */}
          <Link 
            to={`/chat/${friend._id}`} 
            className="btn btn-primary w-full gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group/btn"
          >
            <MessageSquareIcon className="size-5 group-hover/btn:rotate-12 transition-transform" />
            Start Chatting
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default FriendCard;

// Helper function for language flags
export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-4 w-5 inline-block rounded shadow-sm ring-1 ring-base-300"
      />
    );
  }
  return null;
}