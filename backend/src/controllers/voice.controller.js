const fs = require("fs/promises");
const { transcribeAudio } = require("../services/stt.service");
const { handleConversationTurn } = require("../services/conversation.service");
const { synthesizeSpeech } = require("../services/tts.service");
const logger = require("../utils/logger");

function getProviderErrorMessage(error, fallbackMessage) {
  const status = error?.status || error?.response?.status;

  if (status === 401) {
    return "Provider authentication failed. Please verify the API key configuration.";
  }

  if (status === 429) {
    return "Provider rate limit exceeded. Please retry after a short wait.";
  }

  if (error?.message?.includes("Connection error")) {
    return "Provider connection failed. Please check deployment network access and API availability.";
  }

  return fallbackMessage;
}

async function buildAudioPayload(replyText) {
  try {
    const audioBuffer = await synthesizeSpeech(replyText);
    return {
      mimeType: "audio/mpeg",
      base64: audioBuffer.toString("base64")
    };
  } catch (error) {
    logger.warn("voice.controller", "Text-to-speech failed. Returning text-only response.", {
      message: error.message,
      status: error?.response?.status || error?.status
    });
    return null;
  }
}

async function processVoice(req, res, next) {
  const uploadedFile = req.file;

  try {
    if (!uploadedFile) {
      return res.status(400).json({ error: "audio file is required" });
    }

    const conversationId = String(req.body.conversationId || "default");
    logger.info("voice.controller", "Processing voice request", { conversationId });

    let transcript;

    try {
      transcript = await transcribeAudio(uploadedFile.path);
    } catch (error) {
      logger.warn("voice.controller", "Speech-to-text failed.", {
        message: error.message,
        status: error?.response?.status || error?.status
      });
      return res.status(error?.status || error?.response?.status || 503).json({
        error: getProviderErrorMessage(
          error,
          "Speech transcription failed. Please try the live microphone mode or retry later."
        )
      });
    }

    if (!transcript) {
      return res.status(400).json({ error: "Could not transcribe audio" });
    }

    const aiResult = await handleConversationTurn({
      conversationId,
      userText: transcript
    });

    const audio = await buildAudioPayload(aiResult.reply);

    return res.status(200).json({
      conversationId,
      transcript,
      ...aiResult,
      audio
    });
  } catch (error) {
    return next(error);
  } finally {
    if (uploadedFile?.path) {
      await fs.unlink(uploadedFile.path).catch(() => null);
    }
  }
}

async function processLiveTurn(req, res, next) {
  try {
    const conversationId = String(req.body.conversationId || "default");
    const transcript = String(req.body.transcript || "").trim();

    if (!transcript) {
      return res.status(400).json({ error: "transcript is required" });
    }

    logger.info("voice.controller", "Processing live turn", { conversationId });

    const aiResult = await handleConversationTurn({
      conversationId,
      userText: transcript
    });

    const audio = await buildAudioPayload(aiResult.reply);

    return res.status(200).json({
      conversationId,
      transcript,
      ...aiResult,
      audio
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  processLiveTurn,
  processVoice
};
