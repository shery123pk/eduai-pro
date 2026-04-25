// Authentication API routes
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, pool } from '../lib/neon.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const isDemoMode = !pool;

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student or teacher' });
  }

  // DEMO MODE: Skip database, create mock user
  if (isDemoMode) {
    const mockUser = {
      id: `demo-${Date.now()}`,
      name,
      email,
      role
    };

    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully (Demo Mode)',
      token,
      user: mockUser
    });
  }

  // PRODUCTION MODE: Use database
  // Check if user exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const result = await query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
    [name, email, hashedPassword, role]
  );

  const user = result.rows[0];

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // DEMO MODE: Accept any credentials
  if (isDemoMode) {
    // Determine role based on email or default to student
    const role = email.includes('teacher') ? 'teacher' : 'student';

    const mockUser = {
      id: `demo-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role
    };

    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful (Demo Mode)',
      token,
      user: mockUser
    });
  }

  // PRODUCTION MODE: Use database
  // Find user
  const result = await query(
    'SELECT id, name, email, password, role FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// Get current user info
router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');

    // DEMO MODE: Return user from token
    if (isDemoMode) {
      return res.json({
        user: {
          id: decoded.id,
          name: decoded.email.split('@')[0],
          email: decoded.email,
          role: decoded.role,
          created_at: new Date().toISOString()
        }
      });
    }

    // PRODUCTION MODE: Query database
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
}));

export default router;
