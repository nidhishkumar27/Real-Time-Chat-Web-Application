import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware for Express routes
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Token is not valid' });
    }
    
    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('[Auth] Error:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Middleware for Socket.io connections
export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    socket.userId = decoded.userId;
    socket.user = user;
    next();
  } catch (error) {
    console.error('[Socket Auth] Error:', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
};



