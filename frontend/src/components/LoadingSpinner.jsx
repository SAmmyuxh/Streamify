import { Loader } from "lucide-react";
import { motion } from "framer-motion";
import GlassBackground from "./GlassBackground";

const LoadingSpinner = () => {
  return (
    <div className="relative h-screen flex items-center justify-center">
      <GlassBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 glass-panel p-8 rounded-2xl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="size-12 text-primary" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
