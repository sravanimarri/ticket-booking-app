'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import SeatGrid from '@/components/SeatGrid';
import { jwtDecode } from 'jwt-decode';

export default function BookingPage() {
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [userId, setUserId] = useState(null);
  const [requestedSeats, setRequestedSeats] = useState('');

  const fetchSeats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/seats');
      setSeats(res.data);
    } catch {
      toast.error('Failed to fetch seats');
    }
  };

  const handleAutoSelect = () => {
    const count = parseInt(requestedSeats);
    if (!count || count < 1 || count > 7) {
      toast.error('Enter a number between 1 and 7');
      return;
    }

    const availableSeats = seats.filter(s => !s.is_booked);
    const selectedSeats = findAdjacentSeats(availableSeats, count);

    if (selectedSeats.length < count) {
      toast.warning('Not enough adjacent seats. Picking closest available.');
      setSelected(availableSeats.slice(0, count).map(s => s.seat_number));
    } else {
      setSelected(selectedSeats.map(s => s.seat_number));
    }
  };

  const findAdjacentSeats = (available, count) => {
    const ROW_SIZE = 7;
    const totalSeats = 80;
    const selected = [];

    const seatMap = Array(totalSeats + 1).fill(false);
    available.forEach(seat => {
      seatMap[seat.seat_number] = true;
    });

    for (let i = 0; i < Math.floor(totalSeats / ROW_SIZE); i++) {
      const start = i * ROW_SIZE + 1;
      const end = start + ROW_SIZE - 1;

      for (let j = start; j <= end - count + 1; j++) {
        let chunk = [];
        for (let k = 0; k < count; k++) {
          if (seatMap[j + k]) {
            chunk.push(j + k);
          } else {
            break;
          }
        }

        if (chunk.length === count) {
          return chunk.map(seat_number => ({ seat_number }));
        }
      }
    }

    return available.slice(0, count);
  };

  const handleBooking = async () => {
    if (selected.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/seats/book',
        { count: selected.length },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Booked: ${res.data.seats.join(', ')}`);
      setSelected([]);
      setRequestedSeats('');
      fetchSeats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleReset = async () => {
    try {
      await axios.post('http://localhost:5000/api/seats/reset');
      toast.success('All bookings reset');
      setSelected([]);
      fetchSeats();
    } catch (err) {
      toast.error('Reset failed');
    }
  };

  useEffect(() => {
    fetchSeats();
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
    }
  }, []);

  const booked = seats.filter(s => s.is_booked).length;
  const total = seats.length;
  const available = total - booked;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Ticket Booking</h1>

      {/* Side-by-side container */}
      <div className="flex gap-12 items-start justify-center">
        {/* Seat Grid */}
        <div>
          <SeatGrid
            seats={seats}
            selected={selected}
            setSelected={setSelected}
            userId={userId}
          />
          <div className="flex gap-4 mt-6 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500 rounded" /> Available
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded" /> Booked
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-400 rounded" /> Selected
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-600 rounded" /> My Booking
            </span>
          </div>
        </div>

        {/* Booking Panel */}
        <div className="flex flex-col gap-4 w-72">
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="7"
              placeholder="Seats to book"
              value={requestedSeats}
              onChange={(e) => setRequestedSeats(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
            <button
              onClick={handleAutoSelect}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Auto-Select
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selected.map(seat => (
              <span
                key={seat}
                className="bg-yellow-400 px-3 py-1 rounded text-sm"
              >
                {seat}
              </span>
            ))}
          </div>

          <button
            onClick={handleBooking}
            disabled={selected.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Book {selected.length} seat{selected.length !== 1 ? 's' : ''}
          </button>

          <button
            onClick={handleReset}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reset Bookings
          </button>

          <div className="text-sm mt-2">
            <p>🎫 Total Seats: {total}</p>
            <p>✅ Available: {available}</p>
            <p>❌ Booked: {booked}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
