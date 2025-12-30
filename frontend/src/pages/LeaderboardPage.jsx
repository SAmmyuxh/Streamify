import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion } from "framer-motion";

const LeaderboardPage = () => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await axiosInstance.get("/gamification/leaderboard");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Trophy className="size-10 text-yellow-500 fill-yellow-500 animate-bounce" />
          Leaderboard
        </h1>
        <p className="text-base-content/70">Top learners this week. Keep practicing to climb the ranks!</p>
      </motion.div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 sm:gap-8 min-h-[200px] py-8">
        {/* 2nd Place */}
        {leaderboard?.[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="relative">
              <img src={leaderboard[1].profilePic || "/avatar.png"} className="size-16 sm:size-20 rounded-full border-4 border-slate-300 shadow-lg" alt={leaderboard[1].fullName} />
              <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-800 rounded-full size-8 flex items-center justify-center font-bold shadow">2</div>
            </div>
            <div className="text-center mt-2">
              <p className="font-bold truncate w-24 sm:w-32">{leaderboard[1].fullName}</p>
              <p className="text-slate-400 text-sm">{leaderboard[1].xp} XP</p>
            </div>
            <div className="w-16 sm:w-24 h-24 bg-gradient-to-t from-slate-300/20 to-transparent rounded-t-lg" />
          </motion.div>
        )}

        {/* 1st Place */}
        {leaderboard?.[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2 mb-4"
          >
            <div className="relative">
              <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 size-8 text-yellow-500 fill-yellow-500 animate-pulse" />
              <img src={leaderboard[0].profilePic || "/avatar.png"} className="size-20 sm:size-24 rounded-full border-4 border-yellow-400 shadow-xl ring-4 ring-yellow-400/20" alt={leaderboard[0].fullName} />
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full size-8 flex items-center justify-center font-bold shadow">1</div>
            </div>
             <div className="text-center mt-2">
              <p className="font-bold text-lg truncate w-28 sm:w-36">{leaderboard[0].fullName}</p>
              <p className="text-yellow-500 font-bold">{leaderboard[0].xp} XP</p>
            </div>
            <div className="w-20 sm:w-28 h-32 bg-gradient-to-t from-yellow-400/20 to-transparent rounded-t-lg" />
          </motion.div>
        )}

        {/* 3rd Place */}
        {leaderboard?.[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="relative">
              <img src={leaderboard[2].profilePic || "/avatar.png"} className="size-16 sm:size-20 rounded-full border-4 border-amber-600 shadow-lg" alt={leaderboard[2].fullName} />
              <div className="absolute -bottom-2 -right-2 bg-amber-600 text-amber-100 rounded-full size-8 flex items-center justify-center font-bold shadow">3</div>
            </div>
             <div className="text-center mt-2">
              <p className="font-bold truncate w-24 sm:w-32">{leaderboard[2].fullName}</p>
              <p className="text-amber-600 text-sm">{leaderboard[2].xp} XP</p>
            </div>
            <div className="w-16 sm:w-24 h-16 bg-gradient-to-t from-amber-600/20 to-transparent rounded-t-lg" />
          </motion.div>
        )}
      </div>

      {/* List View for Others */}
      <div className="bg-base-100/50 backdrop-blur-xl rounded-3xl p-2 sm:p-6 border border-base-300 shadow-xl">
        {leaderboard?.slice(3).map((user, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.5 }}
            key={user._id} 
            className="flex items-center gap-4 p-4 hover:bg-base-200/50 rounded-2xl transition-all border-b border-base-200/50 last:border-none"
          >
            <span className="font-bold text-base-content/50 w-6 text-center">{index + 4}</span>
            <img src={user.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover" alt={user.fullName} />
            <div className="flex-1">
              <h3 className="font-bold">{user.fullName}</h3>
              <p className="text-xs text-base-content/60">Level {user.level || 1} • {user.nativeLanguage} → {user.learningLanguage}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-primary">{user.xp} XP</span>
            </div>
          </motion.div>
        ))}
        {leaderboard?.length === 0 && (
           <div className="text-center py-10 text-base-content/50">
             No data available yet.
           </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
