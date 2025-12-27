import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { 
  UserCheckIcon, 
  UserXIcon, 
  MessageSquareIcon,
  Clock,
  UserPlusIcon,
  UsersIcon,
  SparklesIcon,
  CheckCircle2Icon
} from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const FriendsPage = () => {
  const queryClient = useQueryClient();

  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/friends");
      return res.data;
    },
    refetchInterval: 5000,
  });

  const { data: friendRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/friend-requests");
      return res.data;
    },
    refetchInterval: 5000,
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const res = await axiosInstance.post(`/users/friend-requests/accept/${requestId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Friend request accepted!");
      queryClient.invalidateQueries(["friendRequests"]);
      queryClient.invalidateQueries(["friends"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to accept request");
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const res = await axiosInstance.post(`/users/friend-requests/reject/${requestId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Friend request rejected");
      queryClient.invalidateQueries(["friendRequests"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to reject request");
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* ENHANCED HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative glass-panel p-8 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 border-2 border-primary/30 shadow-2xl overflow-hidden"
      >
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
        </div>

        <div className="relative flex items-center gap-6">
          <div className="bg-gradient-to-br from-primary to-primary/50 p-5 rounded-3xl shadow-xl">
            <UsersIcon className="size-10 text-primary-content" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%] animate-gradient">
              Friends & Connections
            </h1>
            <p className="text-base-content/70 flex items-center gap-2">
              <SparklesIcon className="size-4" />
              Manage your network and build meaningful relationships
            </p>
          </div>

          {/* Stats Badge */}
          <div className="hidden sm:flex flex-col gap-2">
            <div className="bg-base-100/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-primary/30 text-center">
              <div className="text-2xl font-bold text-primary">{friends?.length || 0}</div>
              <div className="text-xs text-base-content/60">Friends</div>
            </div>
            <div className="bg-base-100/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-warning/30 text-center">
              <div className="text-2xl font-bold text-warning">{friendRequests?.length || 0}</div>
              <div className="text-xs text-base-content/60">Pending</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FRIEND REQUESTS SECTION */}
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="bg-warning/20 p-2 rounded-xl">
              <Clock className="size-6 text-warning" />
            </div>
            Pending Requests
            {friendRequests?.length > 0 && (
              <span className="badge badge-warning badge-lg gap-2 shadow-lg animate-pulse">
                {friendRequests.length}
                <span className="text-xs">new</span>
              </span>
            )}
          </h2>
        </motion.div>

        {isLoadingRequests ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-panel h-48 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !friendRequests?.length ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 rounded-3xl text-center bg-gradient-to-br from-base-200/50 to-base-200/20 border-2 border-dashed border-base-300"
          >
            <div className="w-20 h-20 bg-base-300/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2Icon className="size-10 text-success" />
            </div>
            <p className="text-lg font-semibold mb-2">All caught up! 🎉</p>
            <p className="text-base-content/60">No pending friend requests at the moment</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {friendRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-2xl flex flex-col gap-4 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/30 group"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg group-hover:bg-primary/50 transition-all" />
                      <img
                        src={request.sender.profilePic || "/avatar.png"}
                        alt={request.sender.fullName}
                        className="size-16 rounded-full object-cover ring-4 ring-base-100 relative z-10 group-hover:scale-110 transition-transform"
                      />
                      <span className="absolute bottom-0 right-0 size-4 bg-success rounded-full ring-2 ring-base-100 z-20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                        {request.sender.fullName}
                      </h3>
                      <p className="text-sm text-base-content/60 flex items-center gap-1">
                        <SparklesIcon className="size-3" />
                        {request.sender.nativeLanguage} → {request.sender.learningLanguage}
                      </p>
                    </div>
                  </div>

                  {/* Bio Preview */}
                  {request.sender.bio && (
                    <p className="text-sm text-base-content/70 line-clamp-2 bg-base-200/30 p-3 rounded-xl">
                      {request.sender.bio}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => acceptRequestMutation.mutate(request._id)}
                      disabled={acceptRequestMutation.isPending}
                      className="btn btn-success flex-1 gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                      {acceptRequestMutation.isPending ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <UserCheckIcon className="size-4" />
                      )}
                      Accept
                    </button>
                    <button
                      onClick={() => rejectRequestMutation.mutate(request._id)}
                      disabled={rejectRequestMutation.isPending}
                      className="btn btn-ghost gap-2 text-error hover:bg-error/10 border-2 border-error/20 hover:border-error hover:scale-105 transition-all"
                    >
                      <UserXIcon className="size-4" />
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* FRIENDS LIST SECTION */}
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="bg-success/20 p-2 rounded-xl">
              <UserCheckIcon className="size-6 text-success" />
            </div>
            My Friends
            {friends?.length > 0 && (
              <span className="badge badge-success badge-lg text-white shadow-lg">
                {friends.length}
              </span>
            )}
          </h2>
        </motion.div>

        {isLoadingFriends ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-panel h-32 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !friends?.length ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-16 rounded-3xl text-center bg-gradient-to-br from-base-200/50 to-base-200/20 border-2 border-dashed border-base-300"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <UserPlusIcon className="size-12 text-primary" />
            </div>
            <p className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Start Your Journey
            </p>
            <p className="text-base-content/60 mb-6 max-w-md mx-auto">
              Connect with language partners from around the world and start meaningful conversations!
            </p>
            <Link to="/" className="btn btn-primary btn-lg gap-2 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <SparklesIcon className="size-5" />
              Discover Partners
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend, index) => (
              <motion.div
                key={friend._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-5 rounded-2xl flex items-center gap-4 group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/30"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/40 transition-all" />
                  <img
                    src={friend.profilePic || "/avatar.png"}
                    alt={friend.fullName}
                    className="size-16 rounded-full object-cover ring-4 ring-base-100 group-hover:ring-primary/50 transition-all relative z-10 group-hover:scale-110"
                  />
                  {/* Removed static online indicator */}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                    {friend.fullName}
                  </h3>
                  <p className="text-sm text-base-content/60 truncate flex items-center gap-1">
                    {friend.location ? (
                      <>
                        <span className="size-1.5 rounded-full bg-primary" />
                        {friend.location}
                      </>
                    ) : (
                      "Global"
                    )}
                  </p>
                </div>

                <Link
                  to={`/chat/${friend._id}`}
                  className="btn btn-circle btn-primary btn-sm shadow-lg hover:shadow-xl hover:scale-110 hover:rotate-12 transition-all"
                >
                  <MessageSquareIcon className="size-5" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FriendsPage;