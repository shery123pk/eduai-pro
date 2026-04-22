// Courses API routes
import express from 'express';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { query } from '../lib/neon.js';

const router = express.Router();

// Create course (Teacher only)
router.post('/', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const teacherId = req.user.id;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const result = await query(
    'INSERT INTO courses (title, description, teacher_id) VALUES ($1, $2, $3) RETURNING *',
    [title, description || '', teacherId]
  );

  res.status(201).json({
    success: true,
    course: result.rows[0]
  });
}));

// Get all courses
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT c.id, c.title, c.description, c.created_at, u.name as teacher_name
     FROM courses c
     JOIN users u ON c.teacher_id = u.id
     ORDER BY c.created_at DESC`
  );

  res.json({ courses: result.rows });
}));

// Get teacher's courses
router.get('/my-courses', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT c.id, c.title, c.description, c.created_at,
            (SELECT COUNT(*) FROM documents WHERE course_id = c.id) as document_count,
            (SELECT COUNT(*) FROM quizzes WHERE course_id = c.id) as quiz_count
     FROM courses c
     WHERE c.teacher_id = $1
     ORDER BY c.created_at DESC`,
    [req.user.id]
  );

  res.json({ courses: result.rows });
}));

// Get single course
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT c.id, c.title, c.description, c.created_at, u.name as teacher_name, u.email as teacher_email
     FROM courses c
     JOIN users u ON c.teacher_id = u.id
     WHERE c.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Course not found' });
  }

  res.json({ course: result.rows[0] });
}));

// Update course (Teacher only)
router.put('/:id', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  // Verify ownership
  const ownerCheck = await query(
    'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
    [id, req.user.id]
  );

  if (ownerCheck.rows.length === 0) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const result = await query(
    'UPDATE courses SET title = $1, description = $2 WHERE id = $3 RETURNING *',
    [title, description, id]
  );

  res.json({
    success: true,
    course: result.rows[0]
  });
}));

// Delete course (Teacher only)
router.delete('/:id', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify ownership
  const ownerCheck = await query(
    'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
    [id, req.user.id]
  );

  if (ownerCheck.rows.length === 0) {
    return res.status(403).json({ error: 'Access denied' });
  }

  await query('DELETE FROM courses WHERE id = $1', [id]);

  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
}));

export default router;
