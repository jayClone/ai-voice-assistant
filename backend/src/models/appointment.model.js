const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    conversationId: {
      type: String,
      required: true,
      index: true
    },
    source: {
      type: String,
      default: "voice-assistant"
    },
    status: {
      type: String,
      default: "confirmed"
    },
    scheduledWindow: {
      type: String,
      default: "Next available slot"
    },
    summary: {
      type: String,
      required: true
    },
    data: {
      name: {
        type: String,
        default: null
      },
      budget: {
        type: String,
        required: true
      },
      location: {
        type: String,
        required: true
      },
      requirement: {
        type: String,
        required: true
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
