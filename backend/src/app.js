const express = require("express");
const cors = require("cors");
const bookingRouter = require("./routes/booking.route");
const voiceRouter = require("./routes/voice.route");
const { connectDatabase } = require("./config/database");
const { env, validateEnv } = require("./config/env");
const logger = require("./utils/logger");

validateEnv();

const app = express();
const allowedOrigins = env.FRONTEND_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    }
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", voiceRouter);
app.use("/api", bookingRouter);

app.use((error, req, res, next) => {
  logger.error("app", "Unhandled error", {
    message: error.message,
    stack: error.stack
  });

  res.status(500).json({
    error: "Internal server error",
    message: error.message
  });
});

async function startServer() {
  await connectDatabase();
  app.listen(env.PORT, () => {
    logger.info("app", `Voice AI Assistant server started on port ${env.PORT}`);
  });
}

startServer().catch((error) => {
  logger.error("app", "Failed to start server", {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});
