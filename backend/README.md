# Ticket Booking Backend (Node.js + Express + PostgreSQL)

This is the backend API for the Seat Booking System. It manages user authentication, seat booking logic, and interaction with the PostgreSQL database.

---

##  Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- CORS, bcrypt, dotenv


##  API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Seats
- `GET /api/seats` → Fetch seat layout
- `POST /api/seats/book` → Book N seats
- `POST /api/seats/reset` → Reset all bookings (dev/admin)

---

## Setup Instructions

```bash
cd backend
npm install
cp .env.example .env   # Add your DB credentials + PORT + JWT_SECRET
npm run dev
```

✅ Make sure PostgreSQL is running locally 

---

##  Folder Structure

```bash
backend/
├── controllers/
│   ├── authController.js
│   └── seatController.js
├── routes/
│   ├── authRoutes.js
│   └── seatRoutes.js
├── middleware/
│   └── authMiddleware.js
├── db.js
├── app.js
├── server.js
```



##  Author

-  [Sravani Marri](https://github.com/sravanimarri)
- sravanimarri200@gmail.com

