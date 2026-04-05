const { listAppointmentsByConversation } = require("../services/booking.service");

async function getBookings(req, res, next) {
  try {
    const conversationId = String(req.query.conversationId || "").trim();

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId query parameter is required" });
    }

    const bookings = await listAppointmentsByConversation(conversationId);
    return res.status(200).json({
      conversationId,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getBookings
};
