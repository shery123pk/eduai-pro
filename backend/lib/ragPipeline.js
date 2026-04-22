// RAG (Retrieval-Augmented Generation) Pipeline
import { generateEmbedding, generateChatCompletion } from './openai.js';
import { vectorSearch } from './neon.js';

// Main RAG pipeline
export async function ragQuery(question, courseId, language = 'english') {
  try {
    // Step 1: Generate embedding for the question
    console.log('Generating embedding for question...');
    const questionEmbedding = await generateEmbedding(question);

    // Step 2: Retrieve relevant document chunks using vector similarity
    console.log('Retrieving relevant documents...');
    const relevantDocs = await vectorSearch(questionEmbedding, courseId, 5);

    if (relevantDocs.length === 0) {
      return {
        answer: language === 'urdu'
          ? 'معاف کریں، اس کورس میں متعلقہ مواد نہیں ملا۔'
          : 'Sorry, I could not find relevant information in the course materials.',
        sources: []
      };
    }

    // Step 3: Build context from retrieved documents
    const context = relevantDocs
      .map((doc, idx) => `[Source ${idx + 1}: ${doc.filename}]\n${doc.content}`)
      .join('\n\n---\n\n');

    const sources = relevantDocs.map(doc => ({
      filename: doc.filename,
      similarity: doc.similarity
    }));

    // Step 4: Generate answer using GPT-4 with context
    console.log('Generating answer...');
    const systemPrompt = language === 'urdu'
      ? `آپ ایک AI ٹیچر ہیں۔ صرف دیے گئے کورس مواد کی بنیاد پر جواب دیں۔ اگر جواب مواد میں نہیں ہے تو صاف طور پر بتائیں۔

کورس مواد:
${context}

ہدایات:
- صرف اوپر دیے گئے مواد استعمال کریں
- واضح اور مفید جواب دیں
- اگر یقین نہیں تو بتا دیں
- اردو میں جواب دیں`
      : `You are an AI tutor. Answer the question ONLY based on the following course material. If the answer is not in the material, clearly state that.

Course Material:
${context}

Instructions:
- Use ONLY the material provided above
- Be clear and helpful
- If you're not sure, say so
- Provide specific examples when possible`;

    const answer = await generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ]);

    return {
      answer,
      sources
    };
  } catch (error) {
    console.error('Error in RAG pipeline:', error);
    throw error;
  }
}

// Generate follow-up questions
export async function generateFollowUpQuestions(conversation, language = 'english') {
  const prompt = language === 'urdu'
    ? 'اوپر دی گئی گفتگو کی بنیاد پر 3 اہم سوالات تجویز کریں جو طالب علم پوچھ سکتا ہے:'
    : 'Based on the conversation above, suggest 3 relevant follow-up questions a student might ask:';

  try {
    const response = await generateChatCompletion([
      ...conversation,
      { role: 'user', content: prompt }
    ], { max_tokens: 200 });

    return response.split('\n').filter(q => q.trim().length > 0).slice(0, 3);
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return [];
  }
}
