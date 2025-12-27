import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { 
  MessageSquareIcon, 
  UserPlusIcon, 
  SearchIcon, 
  Clock, 
  UserCheckIcon,
  Sparkles 
} from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [sentRequests, setSentRequests] = useState(new Set());

  const { data: authData } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
  });
  const authUser = authData?.user;

  const { data: recommendedUsers, isLoading } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/recommended");
      return res.data;
    },
  });

  const { data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/friends");
      return res.data;
    },
    refetchInterval: 5000,
  });

  // Fetch pending requests to know which users have pending requests
  const { data: pendingRequests } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/friend-requests/pending");
      return res.data;
    },
    refetchInterval: 5000,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await axiosInstance.post(`/users/send-request/${userId}`);
      return res.data;
    },
    onSuccess: (data, userId) => {
      setSentRequests(prev => new Set([...prev, userId]));
      toast.success("Friend request sent!", {
        icon: "✨",
        style: {
          borderRadius: "12px",
          background: "#10b981",
          color: "#fff",
        },
      });
      queryClient.invalidateQueries(["pendingRequests"]);
    },
    onError: (error, userId) => {
      toast.error(error.response?.data?.message || "Failed to send request", {
        style: {
          borderRadius: "12px",
        },
      });
    },
  });

  const filteredRecommendations = recommendedUsers?.filter((user) => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.nativeLanguage.toLowerCase().includes(searchLower) ||
      user.learningLanguage.toLowerCase().includes(searchLower) ||
      user.interests?.some((i) => i.toLowerCase().includes(searchLower))
    );
  });

  // Check if user has a pending request or is already a friend
  const getUserStatus = (userId) => {
    if (friends?.some(friend => friend._id === userId)) {
      return "friend";
    }
    if (pendingRequests?.some(req => req.recipient._id === userId || req.sender._id === userId)) {
      return "pending";
    }
    if (sentRequests.has(userId)) {
      return "pending";
    }
    return "none";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 sm:p-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-2 border-primary/20"
      >
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <Sparkles className="size-12 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {authUser?.fullName?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="text-base-content/70">
              Connect with language partners and start practicing today
            </p>
          </div>
        </div>
      </motion.div>

      {/* FRIENDS SECTION */}
      <section>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="bg-gradient-to-br from-primary to-primary-focus p-3 rounded-2xl text-primary-content shadow-lg">
            <UserCheckIcon className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Your Friends</h2>
            <p className="text-sm text-base-content/60">
              {friends?.length || 0} language partners
            </p>
          </div>
        </motion.div>
        
        {!friends?.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-10 sm:p-12 rounded-3xl text-center bg-gradient-to-br from-base-200/50 to-base-100"
          >
            <div className="w-20 h-20 bg-base-300/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlusIcon className="size-10 text-base-content/40" />
            </div>
            <p className="text-xl font-semibold mb-2">No friends yet</p>
            <p className="text-base-content/60 max-w-md mx-auto">
              Connect with language partners below to start practicing together!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {friends.map((friend, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={friend._id}
                className="glass-card p-5 rounded-2xl flex items-center gap-4 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={friend.profilePic || "/avatar.png"}
                    alt={friend.fullName}
                    className="size-16 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/60 transition-all shadow-md"
                  />
                  <span className="absolute bottom-0 right-0 size-4 bg-success rounded-full ring-2 ring-base-100 shadow-sm" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{friend.fullName}</h3>
                  <p className="text-sm text-base-content/60 truncate flex items-center gap-1">
                    <span className="font-medium text-primary">{friend.nativeLanguage}</span>
                    <span>→</span>
                    <span>{friend.learningLanguage}</span>
                  </p>
                </div>

                <Link
                  to={`/chat/${friend._id}`}
                  className="btn btn-circle btn-ghost btn-sm hover:bg-primary/20 hover:text-primary hover:scale-110 transition-all"
                >
                  <MessageSquareIcon className="size-5" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* RECOMMENDATIONS SECTION */}
      <section>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-secondary to-secondary-focus p-3 rounded-2xl text-secondary-content shadow-lg">
              <UserPlusIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Discover Learners</h2>
              <p className="text-sm text-base-content/60">
                Find your perfect language partner
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
            <input
              type="text"
              placeholder="Search by language or interest..."
              className="input glass-input w-full pl-12 h-12 rounded-2xl border-2 border-base-300/50 focus:border-primary/50 transition-all shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-panel h-80 rounded-3xl animate-pulse bg-gradient-to-br from-base-200 to-base-100" />
            ))}
          </div>
        ) : !filteredRecommendations?.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 rounded-3xl text-center bg-gradient-to-br from-base-200/50 to-base-100"
          >
            <div className="w-20 h-20 bg-base-300/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="size-10 text-base-content/40" />
            </div>
            <p className="text-xl font-semibold mb-2">No matches found</p>
            <p className="text-base-content/60 max-w-md mx-auto">
              Try adjusting your filters or check back later for new learners!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRecommendations.map((user, index) => {
              const userStatus = getUserStatus(user._id);
              const isFriend = userStatus === "friend";
              const isPending = userStatus === "pending";
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={user._id}
                  className="glass-card p-6 rounded-3xl flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-base-300/30"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="size-16 rounded-full object-cover ring-2 ring-base-content/10 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-base-100 rounded-full p-1 shadow-md">
                          <span className="text-lg">🌍</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{user.fullName}</h3>
                        <p className="text-xs text-base-content/60 flex items-center gap-1.5">
                          <span className="size-1.5 bg-base-content/40 rounded-full" />
                          {user.location || "Global"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="bg-base-200/50 rounded-xl p-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-base-content/60 font-medium">Native</span>
                        <span className="font-bold text-base-content">{user.nativeLanguage}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-base-content/60 font-medium">Learning</span>
                        <span className="font-bold text-primary">{user.learningLanguage}</span>
                      </div>
                    </div>
                    
                    {user.interests?.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-base-content/60 font-medium mb-2">Interests</p>
                        <div className="flex flex-wrap gap-1.5">
                          {user.interests.slice(0, 4).map((interest, i) => (
                            <span 
                              key={i} 
                              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                          {user.interests.length > 4 && (
                            <span className="text-xs px-3 py-1.5 text-base-content/50 font-medium">
                              +{user.interests.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {isFriend ? (
                      <Link
                        to={`/chat/${user._id}`}
                        className="btn btn-primary w-full gap-2 shadow-lg hover:shadow-xl transition-all"
                      >
                        <MessageSquareIcon className="size-4" />
                        Message
                      </Link>
                    ) : isPending ? (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        disabled
                        className="btn btn-outline w-full gap-2 cursor-not-allowed"
                      >
                        <Clock className="size-4" />
                        Request Pending
                      </motion.button>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-primary w-full gap-2 shadow-lg hover:shadow-xl transition-all"
                        onClick={() => sendRequestMutation.mutate(user._id)}
                        disabled={sendRequestMutation.isPending}
                      >
                        {sendRequestMutation.isPending ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4" />
                            Connect
                          </>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;