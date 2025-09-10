const Booking = require('../models/Booking');

const createBooking = async (req, res) => {
  try {
    const booking = new Booking({
      ...req.body,
      user: req.user ? req.user.id : null
    });

    const savedBooking = await booking.save();
    res.status(201).json({ message: "Booking created successfully!", booking: savedBooking });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user ? req.user.id : null }).populate("car");
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

module.exports = { createBooking, getBookings };
