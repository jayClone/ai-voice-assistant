const fs = require("fs/promises");
const { transcribeAudio } = require("../services/stt.service");
const { handleConversationTurn } = require("../services/conversation.service");
const { synthesizeSpeech } = require("../services/tts.service");
const logger = require("../utils/logger");

async function processVoice(req, res, next) {
  const uploadedFile = req.file;

  try {
    if (!uploadedFile) {
      return res.status(400).json({ error: "audio file is required" });
    }

    const conversationId = String(req.body.conversationId || "default");
    logger.info("voice.controller", "Processing voice request", { conversationId });

    const transcript = await transcribeAudio(uploadedFile.path);

    if (!transcript) {
      return res.status(400).json({ error: "Could not transcribe audio" });
    }

    const aiResult = await handleConversationTurn({
      conversationId,
      userText: transcript
    });

    const audioBuffer = await synthesizeSpeech(aiResult.reply);
    const audioBase64 = audioBuffer.toString("base64");

    return res.status(200).json({
      conversationId,
      transcript,
      ...aiResult,
      audio: {
        mimeType: "audio/mpeg",
        base64: audioBase64
      }
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

    const audioBuffer = await synthesizeSpeech(aiResult.reply);
    const audioBase64 = audioBuffer.toString("base64");

    return res.status(200).json({
      conversationId,
      transcript,
      ...aiResult,
      audio: {
        mimeType: "audio/mpeg",
        base64: audioBase64
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  processLiveTurn,
  processVoice
};
