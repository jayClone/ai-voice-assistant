const dotenv = require("dotenv");

dotenv.config();

const env = {
  PORT: Number(process.env.PORT || 3000),
  MONGODB_URI: process.env.MONGODB_URI,
  FRONTEND_ORIGINS: process.env.FRONTEND_ORIGINS || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  WHISPER_MODEL: process.env.WHISPER_MODEL || "whisper-1",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL",
  ELEVENLABS_MODEL_ID: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
  MAX_CONTEXT_MESSAGES: Number(process.env.MAX_CONTEXT_MESSAGES || 10)
};

function validateEnv() {
  const missing = [];

  if (!env.MONGODB_URI) {
    missing.push("MONGODB_URI");
  }

  if (!env.OPENAI_API_KEY) {
    missing.push("OPENAI_API_KEY");
  }

  if (!env.GEMINI_API_KEY) {
    missing.push("GEMINI_API_KEY");
  }

  if (!env.ELEVENLABS_API_KEY) {
    missing.push("ELEVENLABS_API_KEY");
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

module.exports = {
  env,
  validateEnv
};
