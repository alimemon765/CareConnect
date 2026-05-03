require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

const allowedOrigin = (origin, callback) => {
  if (
    !origin ||
    origin.startsWith('http://localhost') ||
    origin.endsWith('.vercel.app')
  ) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors({ origin: allowedOrigin, credentials: true }));

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CareConnect API is running',
    timestamp: new Date().toISOString(),
  });
});

// Pass io to emergency controller
const emergencyController = require('./controllers/emergencyController');
emergencyController.setIO(io);

app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/ambulance', require('./routes/ambulance'));
app.use('/api/notifications', require('./routes/notifications'));

// Socket.io
io.on('connection', (socket) => {
  socket.on('driver:join', (userId) => socket.join(`driver:${userId}`));
  socket.on('patient:join', (requestId) => socket.join(`emergency:${requestId}`));
  socket.on('admin:join', () => socket.join('admin-room'));
  socket.on('user:join', (userId) => socket.join(`user:${userId}`));
  socket.on('driver:location', ({ requestId, lat, lng }) => {
    io.to(`emergency:${requestId}`).emit('driver:location', { lat, lng });
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 5001, () =>
      console.log(`Server running on port ${process.env.PORT || 5001}`)
    );
  })
  .catch((err) => console.error('MongoDB error:', err));
