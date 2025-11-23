import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d',
  });
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  '/signup',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken',
        });
      }
      
      // Create new user
      const user = new User({
        username,
        email,
        password,
      });
      
      await user.save();
      
      // Generate token
      const token = generateToken(user._id);
      
      console.log(`[Auth] New user registered: ${username} (${email})`);
      
      // Import io dynamically to avoid circular dependency
      try {
        const { io } = await import('../server.js');
        
        // Notify all connected users about the new user
        if (io) {
          io.emit('user:registered', {
            user: {
              _id: user._id,
              id: user._id,
              username: user.username,
              email: user.email,
              createdAt: user.createdAt,
            },
          });
          console.log(`[Auth] Broadcasted new user registration to all connected clients`);
        }
      } catch (error) {
        console.warn('[Auth] Could not emit user:registered event:', error.message);
      }
      
      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('[Auth] Signup error:', error.message);
      res.status(500).json({ error: 'Server error during signup' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken(user._id);
      
      console.log(`[Auth] User logged in: ${user.username} (${email})`);
      
      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('[Auth] Login error:', error.message);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error('[Auth] Get user error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (for chat list)
// @access  Private
router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('username email createdAt')
      .sort({ username: 1 });
    
    res.json({ users });
  } catch (error) {
    console.error('[Auth] Get users error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;


