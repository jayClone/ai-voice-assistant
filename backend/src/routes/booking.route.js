const express = require("express");
const { getBookings } = require("../controllers/booking.controller");

const router = express.Router();

router.get("/bookings", getBookings);

module.exports = router;
