import { VideoIcon } from "lucide-react";
import { motion } from "framer-motion";

function CallButton({ handleVideoCall }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleVideoCall}
      className="btn btn-success btn-sm gap-2 shadow-lg hover:shadow-xl transition-all duration-200 glass-panel border-white/20"
    >
      <VideoIcon className="size-5" />
      <span className="hidden sm:inline">Start Call</span>
    </motion.button>
  );
}

export default CallButton;