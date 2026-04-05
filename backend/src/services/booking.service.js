const Appointment = require("../models/appointment.model");

function buildAppointmentSummary(data) {
  return `Appointment confirmed for ${data.requirement} in ${data.location} with budget ${data.budget}.`;
}

async function createAppointment({ conversationId, data }) {
  const bookingId = `BK-${Date.now().toString().slice(-8)}`;

  const appointment = await Appointment.create({
    bookingId,
    conversationId,
    status: "confirmed",
    scheduledWindow: "Next available slot",
    summary: buildAppointmentSummary(data),
    data: {
      name: data.name || null,
      budget: data.budget,
      location: data.location,
      requirement: data.requirement
    }
  });

  return appointment.toObject();
}

async function listAppointmentsByConversation(conversationId) {
  return Appointment.find({ conversationId }).sort({ createdAt: -1 }).lean();
}

async function findLatestAppointmentByConversation(conversationId) {
  return Appointment.findOne({ conversationId }).sort({ createdAt: -1 }).lean();
}

module.exports = {
  buildAppointmentSummary,
  createAppointment,
  findLatestAppointmentByConversation,
  listAppointmentsByConversation
};
