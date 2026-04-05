const mongoose = require("mongoose");
const { env } = require("./env");
const logger = require("../utils/logger");

async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });

  logger.info("database", "MongoDB connected", {
    host: mongoose.connection.host,
    name: mongoose.connection.name
  });
}

module.exports = {
  connectDatabase
};
