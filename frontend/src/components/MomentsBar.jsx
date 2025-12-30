import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateMomentModal from "./CreateMomentModal";
import { formatDistanceToNow } from "date-fns";

const MomentsBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState(null);

  const { data: moments, isLoading, refetch } = useQuery({
    queryKey: ["moments"],
    queryFn: async () => {
      const res = await axiosInstance.get("/moments");
      return res.data;
    },
    refetchInterval: 30000,
  });

  // if (isLoading) return null; // Removed to show Add Moment button even while loading

  return (
    <>
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Create Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center gap-2 flex-shrink-0"
        >
          <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-dashed border-primary/50 flex items-center justify-center text-primary shadow-sm hover:shadow-md transition-all group">
            <Plus className="size-8 group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span className="text-xs font-medium text-base-content/70">
            Add Moment
          </span>
        </motion.button>

        {/* Loading Skeleton */}
        {isLoading ? (
          [...Array(3)].map((_, i) => (
             <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse">
                <div className="size-16 rounded-2xl bg-base-300"></div>
                <div className="w-12 h-3 bg-base-300 rounded"></div>
             </div>
          ))
        ) : (
          <>
            {/* Moments List */}
            {moments?.map((moment, index) => (
              <motion.div
                key={moment._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
                onClick={() => setSelectedMoment(moment)}
              >
                <div className={`size-16 rounded-2xl p-0.5 bg-gradient-to-tr ${moment.userId._id === "me" ? "from-base-300 to-base-200" : "from-secondary to-accent"} shadow-md hover:shadow-lg transition-shadow`}>
                     <div className="w-full h-full rounded-[14px] overflow-hidden border-2 border-base-100 relative bg-base-200">
                        {moment.media ? (
                             <img src={moment.media} alt="Moment" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-base-100 px-1">
                                 <p className="text-[8px] text-center line-clamp-3 leading-tight text-base-content/70">{moment.content}</p>
                            </div>
                        )}
                     </div>
                </div>
                <span className="text-xs font-medium text-base-content/70 truncate w-16 text-center">
                  {moment.userId.fullName.split(" ")[0]}
                </span>
              </motion.div>
            ))}
            
            {moments?.length === 0 && (
                <div className="flex items-center text-sm text-base-content/40 italic pl-2">
                    Share what you're learning today!
                </div>
            )}
          </>
        )}
      </div>

      <CreateMomentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => refetch()}
      />

       {/* View Moment Modal (Simple Implementation) */}
       <AnimatePresence>
        {selectedMoment && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                onClick={() => setSelectedMoment(null)}
             >
                 <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-base-100 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                 >
                     {selectedMoment.media && (
                        <img src={selectedMoment.media} alt="Moment" className="w-full max-h-[60vh] object-cover" />
                     )}
                     <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <img src={selectedMoment.userId.profilePic || "/avatar.png"} className="size-10 rounded-full" />
                            <div>
                                <h3 className="font-bold">{selectedMoment.userId.fullName}</h3>
                                <p className="text-xs text-base-content/50">{formatDistanceToNow(new Date(selectedMoment.createdAt))} ago</p>
                            </div>
                        </div>
                        {selectedMoment.content && (
                            <p className="text-lg leading-relaxed">{selectedMoment.content}</p>
                        )}
                     </div>
                 </motion.div>
             </motion.div>
        )}
       </AnimatePresence>
    </>
  );
};

export default MomentsBar;
