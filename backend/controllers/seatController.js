const pool = require('../db');
const { initializeSeats,getAllSeats } = require('../models/seatModel');

// controllers/seatController.js
//const { initializeSeats, getAllSeats } = require('../models/seatModel');

const initSeats = async (req, res) => {
  try {
    await initializeSeats();
    res.status(201).json({ message: 'Seats initialized' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const fetchSeats = async (req, res) => {
  try {
    const seats = await getAllSeats();
    res.status(200).json(seats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



const bookSeats = async (req, res) => {
    const { count } = req.body;
    const userId = req.user.id;
  
    if (count < 1 || count > 7) return res.status(400).json({ message: 'You can book 1 to 7 seats only' });
  
    try {
      const result = await pool.query('SELECT * FROM seats WHERE is_booked = FALSE ORDER BY seat_number');
      const availableSeats = result.rows;
  
      if (availableSeats.length < count) {
        return res.status(400).json({ message: 'Not enough seats available' });
      }
  
      // Try finding seats in same row
      const seatsToBook = findSeatsTogether(availableSeats, count);
  
      // If not found, just pick the first N closest
      const selectedSeats = seatsToBook.length ? seatsToBook : availableSeats.slice(0, count);
  
      const seatIds = selectedSeats.map(seat => seat.id);
  
      // Mark seats as booked
      for (const id of seatIds) {
        await pool.query('UPDATE seats SET is_booked = TRUE, user_id = $1 WHERE id = $2', [userId, id]);
      }
  
      res.status(200).json({
        message: 'Seats booked successfully',
        seats: selectedSeats.map(s => s.seat_number),
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Helper: find seats in same row
  function findSeatsTogether(seats, count) {
    const grouped = {};
  
    for (const seat of seats) {
      const row = getRow(seat.seat_number);
      if (!grouped[row]) grouped[row] = [];
      grouped[row].push(seat);
    }
  
    for (const row in grouped) {
      if (grouped[row].length >= count) {
        // Sort and return first N from this row
        return grouped[row].sort((a, b) => a.seat_number - b.seat_number).slice(0, count);
      }
    }
    return [];
  }
  
  function getRow(seatNumber) {
    if (seatNumber <= 77) return Math.ceil(seatNumber / 7);
    return 12; // Last 3 seats are row 12
  }

// Cancel all bookings by logged-in user
const cancelMyBookings = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const result = await pool.query(
        'UPDATE seats SET is_booked = FALSE, user_id = NULL WHERE user_id = $1 RETURNING seat_number',
        [userId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'No bookings found for this user' });
      }
  
      res.status(200).json({
        message: 'Your bookings have been cancelled',
        cancelled_seats: result.rows.map(row => row.seat_number)
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Reset all bookings (admin/debug only)
  const resetAllSeats = async (req, res) => {
    try {
      await pool.query('UPDATE seats SET is_booked = FALSE, user_id = NULL');
      res.status(200).json({ message: 'All seats have been reset' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

module.exports = {
  initSeats,
  fetchSeats,
  bookSeats,
  cancelMyBookings,
  resetAllSeats
};