// models/seatModel.js
const pool = require('../db');

const initializeSeats = async () => {
  for (let i = 1; i <= 80; i++) {
    await pool.query(
      'INSERT INTO seats (seat_number) VALUES ($1) ON CONFLICT (seat_number) DO NOTHING',
      [i]
    );
  }
};

const getAllSeats = async () => {
  const result = await pool.query('SELECT * FROM seats ORDER BY seat_number');
  return result.rows;
};

module.exports = {
  initializeSeats,
  getAllSeats,
};
