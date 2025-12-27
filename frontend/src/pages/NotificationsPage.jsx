import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getNotifications, deleteNotification } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon, CheckIcon, Trash2Icon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 5000,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend request accepted!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to accept request");
    },
  });

  const { mutate: deleteNotificationMutation } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const friendRequests = notifications?.filter(n => n.type === "friend_request_received") || [];
  const newConnections = notifications?.filter(n => n.type === "friend_request_accepted") || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="bg-primary/20 p-3 rounded-xl">
          <BellIcon className="size-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Notifications
        </h1>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {friendRequests.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">{friendRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {friendRequests.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card rounded-2xl overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="relative">
                              <img
                                src={notification.sender.profilePic || "/avatar.png"}
                                alt={notification.sender.fullName}
                                className="size-16 rounded-full object-cover ring-2 ring-primary/20"
                              />
                              <span className="absolute bottom-0 right-0 size-4 bg-success rounded-full ring-2 ring-base-100" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{notification.sender.fullName}</h3>
                              <p className="text-sm text-base-content/70">
                                Sent you a friend request
                              </p>
                              <div className="text-xs text-base-content/50 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all"
                            onClick={() => acceptRequestMutation(notification.relatedId)}
                            disabled={isPending}
                          >
                            <CheckIcon className="size-4" />
                            Accept
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {newConnections.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {newConnections.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card rounded-2xl overflow-hidden group"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <img
                            src={notification.sender.profilePic || "/avatar.png"}
                            alt={notification.sender.fullName}
                            className="size-12 rounded-full object-cover ring-2 ring-success/20"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{notification.sender.fullName}</h3>
                            <p className="text-sm my-1 text-base-content/80">
                              Accepted your friend request
                            </p>
                            <p className="text-xs flex items-center gap-1 text-base-content/60">
                              <ClockIcon className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Link
                              to={`/chat/${notification.sender._id}`}
                              className="btn btn-sm btn-ghost"
                            >
                              Message
                            </Link>
                            <button 
                              className="btn btn-ghost btn-xs text-base-content/40 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteNotificationMutation(notification._id)}
                            >
                              <Trash2Icon className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {friendRequests.length === 0 && newConnections.length === 0 && (
             <NoNotificationsFound />
          )}
        </>
      )}
    </div>
  );
};
export default NotificationsPage;