# 🔔 ExpiAlert — Real-Time Product Expiry Alert Management System

A full-stack web application for small businesses (pharmacies, supermarkets) to track product expiry dates in real time and receive instant alerts.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Real-Time | Socket.io |
| Auth | JWT |
| Email Alerts | Nodemailer (Gmail) |
| Cron Job | node-cron (daily expiry check at 8 AM) |

---

## 📁 Project Structure

```
expialert/
├── client/          # React frontend
└── server/          # Node.js backend
```

---

## ⚙️ Setup Instructions

### 1. Clone / Download the project

### 2. Setup the Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/expialert
JWT_SECRET=any_random_secret_string
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail"

Start the server:
```bash
npm run dev
```

### 3. Setup the Frontend

```bash
cd client
npm install
cp .env.example .env
```

Start the frontend:
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🚀 Deployment

### Backend → Render
1. Push `server/` folder to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node src/index.js`
5. Add all environment variables from `.env`

### Frontend → Vercel
1. Push `client/` folder to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy

---

## ✨ Features

- 🏢 Multi-business accounts (each business has its own login)
- 📦 Product management (add, edit, delete, search, filter)
- 🔔 Real-time alerts via Socket.io
- 📧 Daily email notifications (Nodemailer)
- ⏰ Cron job runs every day at 8 AM
- 📊 Live dashboard with stats
- ⚙️ Configurable expiry warning threshold per business
- 📱 Mobile-responsive UI

---

## 👨‍💻 Developer

**David** — University of Port Harcourt, CSC 499.2  
Supervisor: Dr. C. D. Ndeekor
