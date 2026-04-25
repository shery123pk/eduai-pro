// Authentication middleware
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Demo tokens — allow through with mock user
  if (token.startsWith('demo-token-')) {
    const role = token.includes('teacher') ? 'teacher' : 'student';
    req.user = { id: 'demo-user-' + role, email: role + '@demo.com', role };
    return next();
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `${role} access required` });
    }
    next();
  };
}

export function requireTeacher(req, res, next) {
  return requireRole('teacher')(req, res, next);
}

export function requireStudent(req, res, next) {
  return requireRole('student')(req, res, next);
}
