import { useState, useEffect, useRef } from "react";
import { Mic, Volume2, ChevronRight, Loader2, Sparkles, Target } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const PHRASES = {
  Spanish: [
    { text: "Hola, ¿cómo estás?", translation: "Hello, how are you?", diff: "Easy" },
    { text: "Me gustaría una taza de café, por favor.", translation: "I would like a cup of coffee, please.", diff: "Medium" },
    { text: "El perro corre rápidamente por el parque.", translation: "The dog runs quickly through the park.", diff: "Hard" },
  ],
  French: [
    { text: "Bonjour, comment ça va ?", translation: "Hello, how are you?", diff: "Easy" },
    { text: "Je voudrais un croissant et un café.", translation: "I would like a croissant and a coffee.", diff: "Medium" },
    { text: "C'est la vie, n'est-ce pas ?", translation: "That's life, isn't it?", diff: "Hard" },
  ],
  German: [
    { text: "Hallo, wie geht es dir?", translation: "Hello, how are you?", diff: "Easy" },
    { text: "Ich möchte bitte ein Bier.", translation: "I would like a beer, please.", diff: "Medium" },
    { text: "Die Wissenschaft ist schwer aber interessant.", translation: "Science is hard but interesting.", diff: "Hard" },
  ],
  Italian: [
    { text: "Ciao, come stai?", translation: "Hello, how are you?", diff: "Easy" },
    { text: "Vorrei una pizza margherita.", translation: "I would like a margherita pizza.", diff: "Medium" },
    { text: "La dolce vita è meravigliosa.", translation: "The sweet life is wonderful.", diff: "Hard" },
  ],
  Japanese: [
    { text: "こんにちは", translation: "Hello (Konnichiwa)", diff: "Easy" },
    { text: "はじめまして", translation: "Nice to meet you (Hajimemashite)", diff: "Medium" },
    { text: "日本語を勉強しています", translation: "I am studying Japanese", diff: "Hard" },
  ],
  English: [
    { text: "Hello, how are you?", translation: "Standard Greeting", diff: "Easy" },
    { text: "The quick brown fox jumps over the lazy dog.", translation: "Pangram", diff: "Medium" },
    { text: "She sells seashells by the seashore.", translation: "Tongue Twister", diff: "Hard" },
  ]
};

const DEEPGRAM_LANGUAGE_CODES = {
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Japanese: "ja",
  English: "en"
};

// Browser SpeechSynthesis uses different format (e.g., "es-ES", "fr-FR")
const SPEECH_LANG_CODES = {
  Spanish: ["es-ES", "es-MX", "es-US", "es"],
  French: ["fr-FR", "fr-CA", "fr"],
  German: ["de-DE", "de-AT", "de"],
  Italian: ["it-IT", "it"],
  Japanese: ["ja-JP", "ja"],
  English: ["en-US", "en-GB", "en-AU", "en"]
};

const VoicePage = () => {
  const { authUser } = useAuthUser();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const learningLang = authUser?.learningLanguage || "English";
  const phrases = PHRASES[learningLang] || PHRASES["English"];
  const currentPhrase = phrases[currentPhraseIndex];

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    setFeedback(null);
    setTranscript("");
    setScore(0);
    setRecordingTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length === 0) {
          toast.error("No audio recorded. Please try again.");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size < 1000) {
          toast.error("Recording too short. Please speak for at least 1 second.");
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          setIsProcessing(true);
          
          try {
            const { data } = await axiosInstance.post("/ai/transcribe", { 
              audio: base64Audio,
              language: DEEPGRAM_LANGUAGE_CODES[learningLang]
            });
            
            if (data.transcript) {
              setTranscript(data.transcript);
              analyzePronunciation(data.transcript);
            } else {
              toast.error("No speech detected. Please try again.");
            }
          } catch (error) {
            console.error("Transcription error:", error);
            const errorMsg = error.response?.data?.message || "Failed to transcribe audio. Please try again.";
            toast.error(errorMsg);
          } finally {
            setIsProcessing(false);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success("Recording started... Speak now!");

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error("Mic access error:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const speakPhrase = () => {
    if (!('speechSynthesis' in window)) {
      toast.error("Text-to-speech not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(currentPhrase.text);
    
    // Get voices (might need to wait for them to load)
    let voices = window.speechSynthesis.getVoices();
    
    // If no voices, try loading them
    if (voices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        voices = window.speechSynthesis.getVoices();
        setVoiceAndSpeak(utterance, voices);
      }, { once: true });
    } else {
      setVoiceAndSpeak(utterance, voices);
    }
  };

  const setVoiceAndSpeak = (utterance, voices) => {
    const langCodes = SPEECH_LANG_CODES[learningLang] || ["en-US", "en"];
    
    // Try to find a voice matching one of the preferred language codes
    let voice = null;
    for (const code of langCodes) {
      voice = voices.find(v => v.lang === code);
      if (voice) break;
      // Also try partial match
      voice = voices.find(v => v.lang.startsWith(code.split('-')[0]));
      if (voice) break;
    }
    
    // Final fallback: look for any voice with the base language code
    if (!voice) {
      const baseLang = langCodes[0]?.split('-')[0] || 'en';
      voice = voices.find(v => v.lang.toLowerCase().startsWith(baseLang));
    }
    
    // Ultimate fallback: first available voice
    if (!voice && voices.length > 0) {
      voice = voices[0];
    }
    
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang; // Explicitly set the language
      console.log("Using voice:", voice.name, voice.lang);
    } else {
      // If no voice found, at least set the language
      utterance.lang = langCodes[0] || 'en-US';
      console.log("No voice found, using language:", utterance.lang);
    }
    
    utterance.rate = 0.85; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      console.log("Speech started with voice:", utterance.voice?.name, "lang:", utterance.lang);
    };
    
    utterance.onerror = (event) => {
      console.error("Speech error:", event);
      toast.error("Failed to play audio. Please try again.");
    };
    
    window.speechSynthesis.speak(utterance);
    toast.success(`Playing ${learningLang} pronunciation...`, { duration: 1500, icon: "🔊" });
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const analyzePronunciation = (spokenText) => {
    const normalize = (str) => str
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,/#!$%^&*;:{}=\-_`~()？¿¡]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const target = normalize(currentPhrase.text);
    const spoken = normalize(spokenText);

    calculateScore(target, spoken);
  };

  const calculateScore = (target, spoken) => {
    if (!spoken) return;

    const targetWords = target.split(' ').filter(w => w.length > 0);
    const spokenWords = spoken.split(' ').filter(w => w.length > 0);
    
    let exactMatches = 0;
    let partialMatches = 0;
    
    targetWords.forEach(targetWord => {
      if (spokenWords.includes(targetWord)) {
        exactMatches++;
      } else {
        const partialMatch = spokenWords.find(spokenWord => {
          const minLen = Math.min(targetWord.length, spokenWord.length);
          const maxLen = Math.max(targetWord.length, spokenWord.length);
          if (minLen / maxLen < 0.5) return false;
          
          let matches = 0;
          for (let i = 0; i < minLen; i++) {
            if (targetWord[i] === spokenWord[i]) matches++;
          }
          return matches / maxLen >= 0.7;
        });
        if (partialMatch) partialMatches++;
      }
    });

    const totalScore = exactMatches + (partialMatches * 0.5);
    const accuracy = targetWords.length > 0 
      ? Math.round((totalScore / targetWords.length) * 100) 
      : 0;
    
    setScore(accuracy);

    if (accuracy >= 90) setFeedback("Perfect! 🎉");
    else if (accuracy >= 75) setFeedback("Excellent! 🌟");
    else if (accuracy >= 60) setFeedback("Good job! 👍");
    else if (accuracy >= 40) setFeedback("Keep trying! 💪");
    else setFeedback("Practice makes perfect! 🌱");
  };

  const handleManualInput = (e) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const inputText = e.currentTarget.value;
      setTranscript(inputText);
      analyzePronunciation(inputText);
      e.currentTarget.value = "";
    }
  };

  const nextPhrase = () => {
    setTranscript("");
    setFeedback(null);
    setScore(0);
    setRecordingTime(0);
    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
  };

  return (
    <div className="min-h-screen py-4 px-3 text-white overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl">
              <Sparkles className="size-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              Pronunciation Lab
            </h1>
          </div>
          <p className="text-sm text-gray-400">Master {learningLang} • Powered by Deepgram</p>
        </motion.div>

        <div className="grid md:grid-cols-[1fr,380px] gap-4 items-start">
          {/* Left Side - Challenge Card */}
          <motion.div 
            key={currentPhrase.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-700 p-6 shadow-2xl">
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Target className="size-5 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Challenge {currentPhraseIndex + 1}/{phrases.length}</span>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  currentPhrase.diff === 'Easy' 
                    ? 'bg-emerald-500 text-white' 
                    : currentPhrase.diff === 'Medium' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-rose-500 text-white'
                }`}>
                  {currentPhrase.diff}
                </span>
              </div>

              {/* Phrase Display */}
              <div className="space-y-4 mb-5">
                <div className="bg-slate-950 rounded-xl p-5 border-2 border-slate-700">
                  <h2 className="text-2xl md:text-3xl font-bold text-center leading-relaxed text-white">
                    {currentPhrase.text}
                  </h2>
                </div>
                <p className="text-lg text-cyan-200 text-center italic font-medium">
                  "{currentPhrase.translation}"
                </p>
              </div>

              {/* Listen Button */}
              <button 
                onClick={speakPhrase}
                className="btn btn-sm w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white font-semibold shadow-lg"
              >
                <Volume2 className="size-5" />
                <span>Listen to Pronunciation</span>
              </button>
            </div>
          </motion.div>

          {/* Right Side - Recording & Results */}
          <div className="space-y-4">
            {/* Recording Control */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-700 p-6 shadow-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40" />
                      <div className="absolute inset-0 bg-red-500/30 rounded-full animate-pulse" />
                    </>
                  )}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-pulse" />
                  )}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`relative z-10 btn btn-circle size-20 border-4 shadow-2xl
                      ${isRecording 
                        ? 'bg-red-600 border-red-400 shadow-red-500/50' 
                        : isProcessing 
                          ? 'bg-blue-600 border-blue-400 shadow-blue-500/50' 
                          : 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 shadow-purple-500/50 hover:scale-105'
                      } 
                      transition-all duration-300
                      ${isProcessing ? 'opacity-75 cursor-wait' : ''}`}
                  >
                    {isProcessing ? (
                      <Loader2 className="size-8 animate-spin text-white" />
                    ) : isRecording ? (
                      <div className="size-6 bg-white rounded" />
                    ) : (
                      <Mic className="size-8 text-white" />
                    )}
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-bold text-white">
                    {isProcessing 
                      ? "Processing..." 
                      : isRecording 
                        ? `Recording ${recordingTime}s` 
                        : "Tap to Record"}
                  </p>
                  <p className="text-xs text-cyan-300 mt-1">
                    {isRecording ? "Max 10 seconds" : "Speak clearly"}
                  </p>
                </div>
              </div>

              {/* Manual Input */}
              <div className="mt-5 pt-5 border-t-2 border-slate-700">
                <label className="text-xs font-semibold text-cyan-300 mb-2 block">Or type manually:</label>
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Type here & press Enter..." 
                  className="input input-bordered w-full bg-slate-950 border-2 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                  onKeyDown={handleManualInput}
                  autoComplete="off"
                  disabled={isProcessing || isRecording}
                />
              </div>
            </div>

            {/* Results */}
            <AnimatePresence>
              {(transcript || feedback) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-700 p-6 shadow-2xl">
                    <p className="text-xs font-semibold text-cyan-300 mb-2">You said:</p>
                    <p className="text-base text-white font-semibold mb-5 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-700">
                      "{transcript}"
                    </p>
                    
                    {feedback && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className={`text-xl font-bold ${
                              score >= 90 ? 'text-emerald-400' 
                              : score >= 75 ? 'text-blue-400' 
                              : score >= 60 ? 'text-amber-400' 
                              : 'text-orange-400'
                            }`}>
                              {feedback}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className={`h-full ${
                                    score >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                                    : score >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                                    : score >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                                    : 'bg-gradient-to-r from-orange-500 to-orange-400'
                                  }`}
                                />
                              </div>
                              <span className="text-lg font-bold text-white min-w-[3.5rem] text-right">{score}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {score < 90 && (
                          <div className="bg-slate-950 rounded-lg p-4 border-2 border-slate-700">
                            <p className="text-xs font-semibold text-cyan-300 mb-2">Target phrase:</p>
                            <p className="text-sm text-white font-medium">
                              "{currentPhrase.text}"
                            </p>
                          </div>
                        )}

                        <button
                          onClick={nextPhrase}
                          className="btn w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 text-white font-bold shadow-lg"
                        >
                          Next Challenge
                          <ChevronRight className="size-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePage;