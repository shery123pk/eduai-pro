// Document upload API routes (Teacher only)
import express from 'express';
import multer from 'multer';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { processDocumentForRAG } from '../lib/embeddings.js';
import { query } from '../lib/neon.js';

// Lazy load pdf-parse to avoid initialization errors
let pdfParse = null;
async function getPdfParse() {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse;
}

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});

// Upload course document (Teacher only)
router.post('/document', authenticateToken, requireTeacher, upload.single('file'), asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ error: 'courseId is required' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  // Verify teacher owns this course
  const courseCheck = await query(
    'SELECT id, title FROM courses WHERE id = $1 AND teacher_id = $2',
    [courseId, req.user.id]
  );

  if (courseCheck.rows.length === 0) {
    return res.status(403).json({ error: 'You do not have access to this course' });
  }

  const filename = req.file.originalname;
  let text = '';

  // Extract text based on file type
  if (req.file.mimetype === 'application/pdf') {
    try {
      const parser = await getPdfParse();
      const pdfData = await parser(req.file.buffer);
      text = pdfData.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      return res.status(400).json({ error: 'Failed to parse PDF file' });
    }
  } else if (req.file.mimetype === 'text/plain') {
    text = req.file.buffer.toString('utf-8');
  }

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'No text content found in file' });
  }

  // Process document for RAG (split into chunks and generate embeddings)
  console.log(`Processing document: ${filename} (${text.length} characters)`);

  const result = await processDocumentForRAG(courseId, filename, text);

  res.json({
    success: true,
    message: 'Document uploaded and processed successfully',
    filename,
    chunksCreated: result.totalChunks,
    courseId
  });
}));

// Get all documents for a course
router.get('/documents/:courseId', authenticateToken, asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const result = await query(
    `SELECT DISTINCT filename, COUNT(*) as chunk_count, MAX(created_at) as uploaded_at
     FROM documents
     WHERE course_id = $1
     GROUP BY filename
     ORDER BY uploaded_at DESC`,
    [courseId]
  );

  res.json({ documents: result.rows });
}));

// Delete document (Teacher only)
router.delete('/document/:courseId/:filename', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  const { courseId, filename } = req.params;

  // Verify teacher owns this course
  const courseCheck = await query(
    'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
    [courseId, req.user.id]
  );

  if (courseCheck.rows.length === 0) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Delete all chunks of this document
  const result = await query(
    'DELETE FROM documents WHERE course_id = $1 AND filename LIKE $2 RETURNING id',
    [courseId, `${filename}%`]
  );

  res.json({
    success: true,
    message: 'Document deleted successfully',
    chunksDeleted: result.rowCount
  });
}));

export default router;
