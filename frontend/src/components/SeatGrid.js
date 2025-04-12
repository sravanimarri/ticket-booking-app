'use client';
export default function SeatGrid({ seats, selected, setSelected, userId }) {
  return (
    <div className="grid grid-cols-7 gap-2 max-w-md">
      {seats.map((seat) => {
        const isBooked = seat.is_booked;
        const isMine = seat.user_id === userId;
        const isSelected = selected.includes(seat.seat_number);

        let color = 'bg-green-500'; // available
        if (isBooked && isMine) color = 'bg-blue-600'; // booked by me
        else if (isBooked) color = 'bg-red-500'; // booked by others
        else if (isSelected) color = 'bg-yellow-400'; // selected by me

        return (
          <div
            key={seat.seat_number}
            className={`w-10 h-10 text-white flex items-center justify-center rounded ${color}`}
          >
            {seat.seat_number}
          </div>
        );
      })}
    </div>
  );
}
