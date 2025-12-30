import { useState, useRef } from "react";
import { X, Image as ImageIcon, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const CreateMomentModal = ({ isOpen, onClose, onSuccess }) => {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size too large (max 5MB)");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;

    setIsLoading(true);
    try {
      const formData = {
        content: content.trim(),
        image: imagePreview, // Sending base64 to controller which handles Cloudinary upload
      };
      
      await axiosInstance.post("/moments/create", formData);
      
      toast.success("Moment shared!");
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to post moment:", error);
      toast.error(error.response?.data?.message || "Failed to post moment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-base-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-base-200">
              <h3 className="font-bold text-lg">Share a Moment</h3>
              <button
                onClick={onClose}
                className="btn btn-circle btn-ghost btn-sm"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <textarea
                placeholder="What's happening? (e.g., Just learned a new word!)"
                className="textarea textarea-ghost w-full min-h-[100px] text-lg resize-none focus:outline-none placeholder:text-base-content/40"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative rounded-xl overflow-hidden bg-base-200 aspect-video group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 btn btn-circle btn-sm btn-error opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-base-200 flex justify-between items-center bg-base-50/50">
              <div className="tooltip" data-tip="Add Image">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-ghost btn-circle text-primary"
                >
                  <ImageIcon className="size-6" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </div>

              <div className="flex gap-3 text-xs text-base-content/40 font-medium">
                 <span>Expires in 24h</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={(!content.trim() && !selectedImage) || isLoading}
                className="btn btn-primary rounded-full px-6 gap-2"
              >
                {isLoading ? (
                  <>
                     <Loader2 className="size-4 animate-spin" />
                     Posting...
                  </>
                ) : (
                  <>
                     Post
                     <Send className="size-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateMomentModal;
