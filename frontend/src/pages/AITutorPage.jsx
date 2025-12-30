import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const AITutorPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hola! Soy tu tutor de español. ¿De qué te gustaría hablar hoy? (Hello! I'm your Spanish tutor. What would you like to talk about today?)",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const { data: authData } = useQuery({ 
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
  });
  const authUser = authData?.user;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const res = await axiosInstance.post("/ai/chat", { message });
      return res.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.response },
      ]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to get response");
       // Remove the user message if failed? Or just show error.
       // For now, key failing simple.
    },
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");
    
    // Optimistic update
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    sendMessageMutation.mutate(userMessage);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col max-w-4xl mx-auto p-4">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel p-4 mb-4 rounded-2xl flex items-center justify-between border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg ring-2 ring-primary/20">
            <Bot className="size-6 text-primary-content" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AI Language Tutor</h1>
            <p className="text-xs text-base-content/60">Practicing {authUser?.learningLanguage || "Target Language"}</p>
          </div>
        </div>
        <button 
           onClick={() => setMessages([{ role: "ai", content: "Hola! ¿Empezamos de nuevo? (Hello! Shall we start over?)" }])}
           className="btn btn-ghost btn-circle btn-sm tooltip tooltip-left"
           data-tip="Reset Chat"
        >
            <RefreshCw className="size-4" />
        </button>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 glass-panel rounded-3xl p-4 mb-4 overflow-y-auto bg-base-100/50 backdrop-blur-sm relative scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
        {messages.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-base-content/30 pointer-events-none">
                 <Bot className="size-20 mb-4 opacity-20" />
                 <p>Start a conversation...</p>
             </div>
        )}
        
        <div className="space-y-4">
          <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative group ${
                  msg.role === "user"
                    ? "bg-primary text-primary-content rounded-tr-none"
                    : "bg-base-200 text-base-content rounded-tl-none border border-base-300"
                }`}
              >
                {/* Avatar */}
                <div className={`absolute -bottom-6 ${msg.role === "user" ? "-right-2" : "-left-2"}`}>
                     {msg.role === "user" ? (
                         <div className="avatar placeholder">
                             <div className="bg-primary/20 text-primary w-6 rounded-full ring-2 ring-base-100">
                                 <User className="size-3" />
                             </div>
                         </div>
                     ) : (
                         <div className="avatar placeholder">
                             <div className="bg-gradient-to-tr from-accent to-secondary text-secondary-content w-6 rounded-full ring-2 ring-base-100 shadow-md">
                                 <Sparkles className="size-3" />
                             </div>
                         </div>
                     )}
                </div>

                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
          
          {sendMessageMutation.isPending && (
             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex justify-start"
             >
                <div className="bg-base-200 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
                    <span className="loading loading-dots loading-sm text-base-content/50"></span>
                </div>
             </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="glass-panel p-2 rounded-full flex gap-2 items-center bg-base-100 shadow-lg border border-base-200 focus-within:border-primary/50 transition-colors">
        <input
          type="text"
          className="input input-ghost w-full rounded-full focus:bg-transparent px-6"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sendMessageMutation.isPending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sendMessageMutation.isPending}
          className="btn btn-circle btn-primary shadow-lg hover:scale-105 transition-transform"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5 ml-0.5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default AITutorPage;
