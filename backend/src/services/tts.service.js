const axios = require("axios");
const { env } = require("../config/env");

async function synthesizeSpeech(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}`;

  const response = await axios.post(
    url,
    {
      text,
      model_id: env.ELEVENLABS_MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    },
    {
      responseType: "arraybuffer",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg"
      }
    }
  );

  return Buffer.from(response.data);
}

module.exports = {
  synthesizeSpeech
};
