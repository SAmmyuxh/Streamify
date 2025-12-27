import { LoaderIcon, MessageSquareIcon } from "lucide-react";
import { motion } from "framer-motion";

function ChatLoader() {
  return (
    <div className="h-[93vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <MessageSquareIcon className="size-12 text-primary" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <LoaderIcon className="animate-spin size-8 text-primary" />
        </motion.div>
        <p className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Connecting to chat...
        </p>
        <p className="text-sm text-base-content/60 text-center max-w-xs">
          Setting up your conversation space
        </p>
      </motion.div>
    </div>
  );
}

export default ChatLoader;