// Embedding generation and vector operations
import { generateEmbedding } from './openai.js';
import { query } from './neon.js';

// Store document with embedding
export async function storeDocumentWithEmbedding(courseId, filename, content) {
  try {
    // Generate embedding for content
    const embedding = await generateEmbedding(content);

    // Store in database
    const embeddingString = `[${embedding.join(',')}]`;
    const result = await query(
      `INSERT INTO documents (course_id, filename, content, embedding)
       VALUES ($1, $2, $3, $4::vector)
       RETURNING id`,
      [courseId, filename, content, embeddingString]
    );

    return result.rows[0].id;
  } catch (error) {
    console.error('Error storing document with embedding:', error);
    throw error;
  }
}

// Split text into chunks for embedding
export function splitTextIntoChunks(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }
  }

  return chunks;
}

// Process document for RAG
export async function processDocumentForRAG(courseId, filename, fullText) {
  try {
    // Split into chunks
    const chunks = splitTextIntoChunks(fullText);

    console.log(`Processing ${chunks.length} chunks for ${filename}`);

    // Store each chunk with embedding
    const chunkIds = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkFilename = `${filename} (chunk ${i + 1}/${chunks.length})`;
      const id = await storeDocumentWithEmbedding(courseId, chunkFilename, chunks[i]);
      chunkIds.push(id);
    }

    return { chunkIds, totalChunks: chunks.length };
  } catch (error) {
    console.error('Error processing document for RAG:', error);
    throw error;
  }
}
