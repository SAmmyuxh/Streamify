import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@deepgram/sdk";
import User from "../models/User.js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Deepgram
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const user = await User.findById(userId);
    const learningLanguage = user.learningLanguage || "Spanish";
    const nativeLanguage = user.nativeLanguage || "English";
    
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are a helpful and friendly language tutor. 
      The user is a native ${nativeLanguage} speaker learning ${learningLanguage}.
      
      Your goal is to help them practice ${learningLanguage}.
      
      Rules:
      1. Reply primarily in ${learningLanguage}.
      2. If the user makes a mistake, politely correct them in ${nativeLanguage} and then continue the conversation in ${learningLanguage}.
      3. Keep your responses concise (1-3 sentences) to keep the conversation flowing.
      4. If the user asks for a translation, provide it in ${nativeLanguage}.
      
      User's message: "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    res.status(500).json({ message: "Failed to generate response", error: error.message });
  }
};

export const transcribeAudio = async (req, res) => {
  try {
    console.log("📝 Deepgram transcription request received");
    
    // Check if Deepgram API key is set
    if (!process.env.DEEPGRAM_API_KEY) {
      console.error("❌ DEEPGRAM_API_KEY is not set in environment variables");
      return res.status(500).json({ 
        message: "Deepgram API key is not configured on the server" 
      });
    }

    const { audio, language } = req.body;

    if (!audio) {
      console.error("❌ No audio data received");
      return res.status(400).json({ message: "Audio data is required" });
    }

    console.log("🎵 Audio data received, language:", language);

    // Remove the data URL prefix
    const base64Data = audio.replace(/^data:audio\/\w+;base64,/, "");
    
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(base64Data, 'base64');
    console.log("✅ Audio buffer created, size:", audioBuffer.length, "bytes");

    // Check if buffer is valid
    if (audioBuffer.length < 100) {
      console.error("❌ Audio buffer too small:", audioBuffer.length, "bytes");
      return res.status(400).json({ 
        message: "Audio data is too short or empty" 
      });
    }

    // Transcribe using Deepgram
    console.log("🎤 Calling Deepgram API...");
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: language || 'en',
        smart_format: true,
        punctuate: true,
      }
    );

    if (error) {
      console.error("❌ Deepgram API error:", error);
      return res.status(500).json({ 
        message: "Deepgram transcription failed", 
        error: error.message 
      });
    }

    // Extract transcript from Deepgram response
    const transcript = result.results.channels[0].alternatives[0].transcript;
    
    if (!transcript || transcript.trim() === "") {
      console.error("⚠️ Empty transcript returned");
      return res.status(400).json({ 
        message: "No speech detected in audio. Please try speaking more clearly." 
      });
    }

    console.log("✅ Transcription successful:", transcript);
    res.status(200).json({ transcript: transcript.trim() });

  } catch (error) {
    console.error("❌ Unexpected error in transcribeAudio:", error);
    console.error("Stack trace:", error.stack);
    
    res.status(500).json({ 
      message: "Transcription failed", 
      error: error.message,
      details: error.response?.data || "Unknown error"
    });
  }
};