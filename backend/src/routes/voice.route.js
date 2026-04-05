const express = require("express");
const multer = require("multer");
const path = require("path");
const { processLiveTurn, processVoice } = require("../controllers/voice.controller");

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.resolve(process.cwd(), "uploads"),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || ".webm");
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
  }
});

const upload = multer({ storage });

router.post("/voice", upload.single("audio"), processVoice);
router.post("/live-turn", processLiveTurn);

module.exports = router;
