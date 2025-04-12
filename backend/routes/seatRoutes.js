// routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const { initSeats, fetchSeats } = require('../controllers/seatController');
const auth = require('../middleware/authMiddleware');
const { bookSeats } = require('../controllers/seatController');
const { cancelMyBookings, resetAllSeats } = require('../controllers/seatController');

router.post('/init', initSeats);     // To populate seats (run once)
router.get('/', fetchSeats);         // To view current seat status
router.post('/book', auth, bookSeats);
router.delete('/cancel', auth, cancelMyBookings);
router.post('/reset', resetAllSeats); // No auth added, but you can protect it if needed

module.exports = router;
