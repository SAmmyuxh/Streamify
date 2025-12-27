import { useMessageInputContext } from "stream-chat-react";
import { Send, Paperclip, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const CustomMessageInput = () => {
  const {
    text,
    handleChange,
    handleSubmit,
    uploadNewFiles,
    attachments,
    removeAttachment,
  } = useMessageInputContext();

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Helper boolean to check if we can send
  // "!!text" converts undefined to false safely
  const isValidText = !!text && text.trim().length > 0;
  const hasAttachments = !!attachments && attachments.length > 0;
  const isSendEnabled = isValidText || hasAttachments;

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (isSendEnabled) {
      handleSubmit(e);
      // Reset height immediately after send
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isSendEnabled) {
        // Manually trigger the form submit
        e.target.form.requestSubmit();
      }
    }
  };

  return (
    <div className="w-full p-4 bg-base-100 border-t border-base-300 relative z-50">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        
        {/* Attachment Previews */}
        <AnimatePresence>
          {hasAttachments && (
            <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide">
              {attachments.map((file, i) => (
                <motion.div
                  key={`${file.name}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group w-20 h-20 bg-base-200 rounded-xl border border-base-300 overflow-hidden flex-shrink-0"
                >
                  {file.type?.startsWith("image") ? (
                    <img 
                      src={URL.createObjectURL(file.file)} 
                      alt="preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Paperclip className="size-6 text-base-content/50" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(file.id)}
                    className="absolute top-0.5 right-0.5 bg-black/50 hover:bg-error text-white p-1 rounded-full transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Input Bar */}
        <form onSubmit={onSubmit} className="flex items-end gap-3">
          {/* Attachment Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-2 p-2.5 rounded-full bg-base-200 hover:bg-base-300 text-base-content/70 hover:text-primary transition-colors"
          >
            <Paperclip className="size-5" />
          </motion.button>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
                if(e.target.files?.length > 0) uploadNewFiles(e.target.files);
                e.target.value = ""; 
            }}
            multiple
          />

          {/* Text Area */}
          <div
            className={`flex-1 flex items-center bg-base-200/50 rounded-3xl border transition-all duration-200 ${
              isFocused 
                ? "border-primary bg-base-100 shadow-[0_0_20px_rgba(var(--p),0.1)]" 
                : "border-transparent"
            }`}
          >
            <textarea
              ref={textareaRef}
              // FIX: Ensure it is never undefined
              value={text || ""} 
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-transparent px-5 py-3 text-base-content placeholder:text-base-content/40 focus:outline-none resize-none max-h-32 min-h-[48px]"
            />
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!isSendEnabled}
            className={`mb-2 p-3 rounded-full transition-all duration-200 ${
              isSendEnabled
                ? "bg-primary text-primary-content shadow-lg shadow-primary/30"
                : "bg-base-300 text-base-content/20 cursor-not-allowed"
            }`}
          >
            <Send className="size-5 ml-0.5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default CustomMessageInput;