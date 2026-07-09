const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const alertRoutes = require('./routes/alerts');
const dashboardRoutes = require('./routes/dashboard');
const { runExpiryCheck } = require('./utils/expiryChecker');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => res.json({ message: 'ExpiAlert API is running 🔔' }));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_business', (businessId) => {
    socket.join(businessId);
    console.log(`Socket ${socket.id} joined room: ${businessId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Cron job — runs every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily expiry check...');
  await runExpiryCheck(io);
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
