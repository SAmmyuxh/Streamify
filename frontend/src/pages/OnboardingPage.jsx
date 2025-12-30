import { useState } from "react";
import { ShipWheelIcon, Globe, BookOpen, MapPin, User, ChevronRight, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "../lib/api";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Japanese",
  "Korean",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Arabic",
  "Hindi",
  "Turkish",
  "Dutch",
  "Swedish",
  "Polish",
  "Greek",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Filipino",
  "Swahili",
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    location: "",
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const { mutate: onboardMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile setup complete! Welcome to Streamify!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to complete setup");
    },
  });

  const handleSubmit = () => {
    onboardMutation(formData);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fullName.trim().length >= 2;
      case 2:
        return formData.bio.trim().length >= 10;
      case 3:
        return formData.nativeLanguage && formData.learningLanguage;
      case 4:
        return formData.location.trim().length >= 2;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="size-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">What's your name?</h2>
              <p className="text-base-content/60">This is how other learners will see you</p>
            </div>
            <div className="form-control">
              <input
                type="text"
                placeholder="Your full name"
                className="input input-bordered input-lg w-full text-center text-lg"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="size-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-base-content/60">Share a bit about your interests and goals</p>
            </div>
            <div className="form-control">
              <textarea
                placeholder="I'm excited to learn new languages and connect with people around the world..."
                className="textarea textarea-bordered textarea-lg w-full h-32 text-base resize-none"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                autoFocus
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  {formData.bio.length}/200 characters (minimum 10)
                </span>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="size-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold">Languages</h2>
              <p className="text-base-content/60">Select your native and learning languages</p>
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Globe className="size-4" /> Native Language
                  </span>
                </label>
                <select
                  className="select select-bordered select-lg w-full"
                  value={formData.nativeLanguage}
                  onChange={(e) => setFormData({ ...formData, nativeLanguage: e.target.value })}
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <BookOpen className="size-4" /> Learning Language
                  </span>
                </label>
                <select
                  className="select select-bordered select-lg w-full"
                  value={formData.learningLanguage}
                  onChange={(e) => setFormData({ ...formData, learningLanguage: e.target.value })}
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.filter((lang) => lang !== formData.nativeLanguage).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="size-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Where are you from?</h2>
              <p className="text-base-content/60">Help others find language partners near them</p>
            </div>
            <div className="form-control">
              <input
                type="text"
                placeholder="City, Country (e.g., Tokyo, Japan)"
                className="input input-bordered input-lg w-full text-center text-lg"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                autoFocus
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-base-200 via-base-100 to-base-200"
      data-theme="forest"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative border border-primary/25 w-full max-w-lg mx-auto bg-base-100/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-base-300/30 bg-base-200/50">
          <div className="flex items-center justify-center gap-3">
            <ShipWheelIcon className="size-10 text-primary drop-shadow-lg" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-base-content/60">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-primary">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 min-h-[300px] flex flex-col justify-center">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="p-6 border-t border-base-300/30 bg-base-200/30 flex justify-between gap-4">
          <button
            className={`btn btn-ghost ${step === 1 ? "invisible" : ""}`}
            onClick={handleBack}
            disabled={isPending}
          >
            Back
          </button>
          <button
            className="btn btn-primary gap-2 flex-1 max-w-[200px]"
            onClick={handleNext}
            disabled={!isStepValid() || isPending}
          >
            {isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : step === totalSteps ? (
              <>
                Complete Setup
                <Sparkles className="size-4" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
