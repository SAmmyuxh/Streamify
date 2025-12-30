import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { 
  CameraIcon, 
  MailIcon, 
  MapPinIcon, 
  UserIcon, 
  SaveIcon, 
  XIcon,
  GlobeIcon,
  SparklesIcon,
  Edit3Icon,
  Zap,
  Trophy,
  Flame
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    interests: authUser?.interests || [],
    profilePic: "", // Add profilePic to state
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  const [newInterest, setNewInterest] = useState("");

  const queryClient = useQueryClient();

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put("/auth/update-profile", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleAddInterest = (e) => {
    if (e.key === "Enter" && newInterest.trim()) {
      e.preventDefault();
      if (!formData.interests.includes(newInterest.trim())) {
        setFormData({
          ...formData,
          interests: [...formData.interests, newInterest.trim()],
        });
      }
      setNewInterest("");
    }
  };

  const removeInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      {/* Enhanced Glass Panel with Gradient Border */}
      <div className="relative">
        {/* Gradient Background Orb */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        
        <div className="glass-panel rounded-3xl overflow-hidden border-2 border-primary/10 shadow-2xl relative">
          {/* Header Section with Cover-like Background */}
          <div className="relative bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 p-8 pb-24">
            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
            </div>

            {/* Profile Avatar Section */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:bg-primary/50 transition-all duration-300" />
                <div className="avatar size-32 relative">
                  <img
                    src={formData.profilePic || authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="rounded-full ring-4 ring-base-100 shadow-2xl group-hover:scale-105 transition-transform duration-300 object-cover"
                  />
                </div>
                {isEditing && (
                  <label className="btn btn-circle btn-sm btn-primary absolute bottom-2 right-2 shadow-xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 cursor-pointer">
                    <CameraIcon className="size-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Content Card - Overlapping Header */}
          <div className="relative -mt-16 mx-4 sm:mx-8 bg-base-100/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-base-300/50 shadow-xl">
            {/* User Info Header */}
            <div className="text-center mb-8">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%] animate-gradient"
              >
                {authUser?.fullName}
              </motion.h1>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base-content/70 mb-4">
                <span className="flex items-center gap-2 bg-base-200/50 px-4 py-2 rounded-full">
                  <MailIcon className="size-4 text-primary" />
                  {authUser?.email}
                </span>
                {authUser?.location && (
                  <span className="flex items-center gap-2 bg-base-200/50 px-4 py-2 rounded-full">
                    <MapPinIcon className="size-4 text-secondary" />
                    {authUser?.location}
                  </span>
                )}
              </div>

              <button
                className="btn btn-primary gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <XIcon className="size-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3Icon className="size-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>

            {/* Edit Form or Display Mode */}
            {isEditing ? (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2">
                        <UserIcon className="size-4 text-primary" />
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input glass-input w-full focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2">
                        <MapPinIcon className="size-4 text-primary" />
                        Location
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input glass-input w-full focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2">
                        <GlobeIcon className="size-4 text-primary" />
                        Native Language
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input glass-input w-full focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.nativeLanguage}
                      onChange={(e) =>
                        setFormData({ ...formData, nativeLanguage: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2">
                        <SparklesIcon className="size-4 text-primary" />
                        Learning Language
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input glass-input w-full focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.learningLanguage}
                      onChange={(e) =>
                        setFormData({ ...formData, learningLanguage: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Interests</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-base-200/30 rounded-xl min-h-[60px]">
                    {formData.interests.map((interest, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="badge badge-primary gap-2 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        {interest}
                        <XIcon
                          className="size-3 hover:text-error transition-colors"
                          onClick={() => removeInterest(interest)}
                        />
                      </motion.span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="input glass-input w-full focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Type and press Enter to add interests"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleAddInterest}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Bio</span>
                  </label>
                  <textarea
                    className="textarea glass-input h-32 resize-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary gap-2 px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <SaveIcon className="size-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-6">
                  {/* About Me Section */}
                  <div className="bg-gradient-to-br from-base-200/50 to-base-200/20 p-6 rounded-2xl border border-base-300/30 hover:border-primary/30 transition-all duration-300 group">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors">
                      <UserIcon className="size-5 text-primary" />
                      About Me
                    </h3>
                    <p className="text-base-content/80 leading-relaxed">
                      {authUser?.bio || (
                        <span className="italic text-base-content/50">
                          No bio added yet. Click "Edit Profile" to add one!
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Interests Section */}
                  <div className="bg-gradient-to-br from-base-200/50 to-base-200/20 p-6 rounded-2xl border border-base-300/30 hover:border-secondary/30 transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <SparklesIcon className="size-5 text-secondary" />
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {authUser?.interests?.length > 0 ? (
                        authUser.interests.map((interest, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="badge badge-lg badge-outline border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all p-3 cursor-default"
                          >
                            {interest}
                          </motion.span>
                        ))
                      ) : (
                        <p className="text-base-content/60 italic">
                          No interests added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Languages Section */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-base-200/50 to-base-200/20 p-6 rounded-2xl border border-base-300/30 hover:border-accent/30 transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <GlobeIcon className="size-5 text-accent" />
                      Languages
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-base-100/50 p-4 rounded-xl border-l-4 border-primary hover:bg-base-100 transition-all group">
                        <span className="text-sm text-base-content/60 block mb-1 font-medium">
                          Native Language
                        </span>
                        <div className="text-lg font-bold text-primary flex items-center gap-2">
                          <span className="size-2 rounded-full bg-primary animate-pulse" />
                          {authUser?.nativeLanguage || "Not specified"}
                        </div>
                      </div>
                      <div className="bg-base-100/50 p-4 rounded-xl border-l-4 border-secondary hover:bg-base-100 transition-all group">
                        <span className="text-sm text-base-content/60 block mb-1 font-medium">
                          Learning Language
                        </span>
                        <div className="text-lg font-bold text-secondary flex items-center gap-2">
                          <SparklesIcon className="size-4 animate-pulse" />
                          {authUser?.learningLanguage || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Card */}
                  {/* Gamification Stats Card */}
                  <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 p-6 rounded-2xl border-2 border-violet-500/20">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                       <Trophy className="size-5 text-yellow-500" />
                       Level Progress
                    </h3>
                    
                    {/* Level Banner */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-base-content/70">Level {authUser?.level || 1}</span>
                      <span className="text-sm font-bold text-violet-400">{authUser?.xp || 0} XP</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-base-300 rounded-full h-3 mb-6 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(((authUser?.xp || 0) % 100), 100)}%` }} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-base-100/50 rounded-xl hover:scale-105 transition-transform">
                        <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                          <Flame className="size-6 fill-orange-500" />
                          {authUser?.streak || 0}
                        </div>
                        <div className="text-xs text-base-content/60 font-medium">Day Streak</div>
                      </div>
                      <div className="text-center p-3 bg-base-100/50 rounded-xl hover:scale-105 transition-transform">
                         <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                          <Zap className="size-6 fill-yellow-500" />
                          {authUser?.xp || 0}
                        </div>
                        <div className="text-xs text-base-content/60 font-medium">Total XP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;