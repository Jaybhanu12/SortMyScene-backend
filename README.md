# SortMyScene-backend

# SortMyScene - Full Stack Ticket Booking System 🎟️

A robust, full-stack seat reservation and ticketing platform built with the MERN stack. This application ensures secure, highly-concurrent ticket bookings with a live 10-minute hold timer, atomic database transactions, and an automated background cleanup process.

**Live Application:** [https://sortmyscene-frontend.onrender.com/](https://sortmyscene-frontend.onrender.com/)

---

## 🚀 Live Demo Credentials

To make testing as seamless as possible, please use the following provisioned accounts on the live site:

**1. Admin Access** (For Event & Seat Management)
* **Email:** `admin@sortmyscene.com`
* **Password:** `SecureAdminPassword123!`

**2. User Access** (For Booking Flow)
* **Email:** `demo@sortmyscene.com`
* **Password:** `demo123456`

---

## ✨ Key Features & Add-ons

* **Real-time Seat Reservation:** Users can lock seats for exactly 10 minutes. If the timer expires, seats are immediately released back to the public pool.
* **OTP Authentication (Add-on):** Secure, production-grade OTP verification for user login/registration.
* **Admin Dashboard (Add-on):** A protected administrative control panel to create events, upload promotional images, and monitor live booking statuses.
* **Resilient UI State Machine:** A predictable 5-state frontend flow (`Selecting` → `Reserving` → `Reserved` → `Confirming` → `Confirmed`) to prevent UI tearing during asynchronous operations.

---

## 🧠 Architecture & Concurrency Control

This system was explicitly designed to handle high-traffic concurrency and prevent "double-booking" anomalies.

### 1. Bulletproof Concurrency (MongoDB Transactions)
Instead of relying solely on application-level pre-checks, concurrency is handled directly at the database layer. When a user attempts to reserve or confirm a seat, the system uses **MongoDB Multi-Document Transactions** combined with an **Atomic Guard Condition**. 
The write operation itself mandates that the seat's status must be strictly `available` (or owned by the specific `reservationId`) to succeed. If two identical requests hit the server at the exact same millisecond, the database engine will intentionally fail the second request, guaranteeing zero double-bookings.

### 2. Automated Seat Release (Cron Job)
Instead of blocking the event loop or relying on delayed queues, the system runs a lightweight `node-cron` job every 60 seconds (`* * * * *`). It performs a highly optimized `updateMany` query that instantly sweeps the database for any reservations where `expiresAt < now()` and flips them to `expired`. This keeps the seating grid accurate without requiring user-triggered page refreshes.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, React Router, Axios, TailwindCSS / Custom CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose
* **Storage:** Cloudinary (for secure image uploads)
* **Deployment:** Render (Both Frontend Static Site & Backend Web Service)

---

## 💻 Local Setup Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16+) and a MongoDB instance running locally or via Atlas.

### 1. Clone the Repository
```bash```
git clone [https://github.com/Jaybhanu12/SortMyScene-backend.git](https://github.com/Jaybhanu12/SortMyScene-backend.git)
git clone [https://github.com/Jaybhanu12/SortMyScene-frontend.git](https://github.com/Jaybhanu12/SortMyScene-frontend.git)

### 2. Environment Variables
Create a `.env` file in the **backend** root directory and add the following keys:

```env```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
REFRESH_TOKEN_SECRET=your_token
JWT_EXPIRES_IN=7d
RESERVATION_EXPIRY_MINUTES=10
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USERNAME=your_email_nodemailer
EMAIL_PASSWORD=your_password

cd SortMyScene-backend
npm install

# Optional: Seed the database with initial events and the Admin user
npm run seed 

# Start the development server
npm run dev



cd SortMyScene-frontend
npm install

```env```
REACT_APP_API_URL=https://sortmyscene-backend.onrender.com/api

# Start the React application (Defaults to http://localhost:3000)
npm start

## 📖 Core API Reference

### Auth Routes
* `POST /api/auth/register` - Register a new user (OTP triggered)
* `POST /api/auth/login` - Authenticate user & return JWT

### Event & Seat Routes
* `GET /api/events` - Fetch all active events
* `GET /api/events/:id` - Fetch single event details
* `GET /api/events/:id/unavailable-seats` - Dynamically calculates currently reserved/booked seats

### Booking Engine Routes
* `POST /api/reserve` - Attempts atomic lock on requested seats (Starts 10m timer)
* `GET /api/reserve/active/:eventId` - Restores active reservations upon browser refresh
* `POST /api/bookings` - Confirms reservation and generates final ticket

### Admin Routes (Requires admin role)
* `POST /api/admin/upload` - Secure image upload via Cloudinary & custom Multer file-filter
* `POST /api/admin/events` - Create dynamic events

---

*Designed and developed by [Jay Bhanushali](https://www.linkedin.com/in/jay-bhanushali-dev/).*
