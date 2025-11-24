import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import { authenticateSocket } from './middleware/auth.js';
import { setupSocketHandlers } from './socket/handlers.js';
import { setupPresence } from './socket/presence.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000', // Development
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL); // Production
}

console.log('[Server] Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    // Allow if origin is in the allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Block all other origins
    console.warn(`[Server] ❌ CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io middleware for authentication
io.use(authenticateSocket);

// Socket.io connection handling
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  // Normalize userId to string for consistent storage and comparison
  const userId = socket.userId?.toString() || String(socket.userId);
  console.log(`[Socket] User connected: ${userId} (${socket.id})`);
  console.log(`[Socket] Total connected users: ${connectedUsers.size + 1}`);
  
  // Add user to connected users map (always store as string)
  connectedUsers.set(userId, socket.id);
  
  // Get all currently online users (excluding the newly connected user)
  const onlineUserIdsBefore = Array.from(connectedUsers.keys()).filter(id => id !== userId);
  console.log(`[Socket] Users already online before ${userId} connected:`, onlineUserIdsBefore);
  
  // Notify ALL existing users that this new user just came online
  // Use io.emit to all sockets, then exclude the sender in client
  if (connectedUsers.size > 1) {
    socket.broadcast.emit('user:online', { userId: userId });
    console.log(`[Socket] ✅ Broadcasted 'user:online' for ${userId} to ${connectedUsers.size - 1} other users`);
  }
  
  // Send list of online users to the newly connected user (exclude current user)
  const onlineUserIds = Array.from(connectedUsers.keys())
    .filter(id => id !== userId)
    .map(id => String(id)); // Ensure all IDs are strings
  
  console.log(`[Socket] 📤 Sending ${onlineUserIds.length} online users to ${userId}:`, onlineUserIds);
  socket.emit('users:online', { userIds: onlineUserIds });
  
  // Setup socket handlers
  setupSocketHandlers(socket, io, connectedUsers);
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${userId} (${socket.id})`);
    connectedUsers.delete(userId);
    
    // Notify all remaining users that this user went offline
    if (connectedUsers.size > 0) {
      socket.broadcast.emit('user:offline', { userId: userId });
      console.log(`[Socket] ✅ Broadcasted 'user:offline' for ${userId} to ${connectedUsers.size} remaining users`);
    }
    
    console.log(`[Socket] Total connected users after disconnect: ${connectedUsers.size}`);
  });
  
  // Debug: Log current state
  console.log(`[Socket] 📊 Current connected users:`, Array.from(connectedUsers.keys()));
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-chat';
    console.log(`[MongoDB] Attempting to connect...`);
    const conn = await mongoose.connect(mongoURI);
    console.log(`[MongoDB] ✅ Connected: ${conn.connection.host}`);
    console.log(`[MongoDB] Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB] ❌ Connection Error: ${error.message}`);
    console.error(`[MongoDB] ⚠️  Server will start but database features won't work`);
    console.error(`[MongoDB] 💡 Fix: Check MONGODB_URI in server/.env and MongoDB Atlas settings`);
    return false;
  }
};

// Start server
const PORT = process.env.PORT || 5000;

// Start server immediately, connect to DB in background
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] ✅ Running on port ${PORT}`);
  console.log(`[Server] 📡 API: http://0.0.0.0:${PORT}/api`);
  
  // Connect to MongoDB in background (non-blocking)
  connectDB().then((dbConnected) => {
    if (!dbConnected) {
      console.log(`[Server] ⚠️  Database not connected - some features disabled`);
      console.log(`[Server] 💡 Check MONGODB_URI environment variable`);
    } else {
      console.log(`[Server] ✅ Database connected successfully`);
    }
  }).catch((error) => {
    console.error(`[Server] ❌ Database connection error: ${error.message}`);
    console.log(`[Server] ⚠️  Server running without database - some features disabled`);
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error(`[Server] ❌ Server error: ${error.message}`);
  if (error.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} is already in use`);
  }
  process.exit(1);
});

export { io, connectedUsers };

