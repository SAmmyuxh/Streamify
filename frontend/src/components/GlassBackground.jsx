import { motion } from "framer-motion";

const GlassBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-base-300">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -60, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
          delay: 2,
        }}
        className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 45, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
          delay: 5,
        }}
        className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px]"
      />
      <div className="absolute inset-0 bg-base-300/40 backdrop-blur-[100px]" />
    </div>
  );
};

export default GlassBackground;
