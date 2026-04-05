const fs = require("fs");
const OpenAI = require("openai");
const { env } = require("../config/env");

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

async function transcribeAudio(filePath) {
  const result = await client.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: env.WHISPER_MODEL
  });

  return (result.text || "").trim();
}

module.exports = {
  transcribeAudio
};
