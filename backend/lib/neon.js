// Neon PostgreSQL connection
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Vector similarity search
export async function vectorSearch(embedding, courseId, limit = 5) {
  const queryText = `
    SELECT
      id,
      content,
      filename,
      1 - (embedding <=> $1::vector) as similarity
    FROM documents
    WHERE course_id = $2
    ORDER BY similarity DESC
    LIMIT $3
  `;

  const embeddingString = `[${embedding.join(',')}]`;
  const result = await query(queryText, [embeddingString, courseId, limit]);
  return result.rows;
}

export default pool;
