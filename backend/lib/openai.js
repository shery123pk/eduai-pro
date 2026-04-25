// OpenAI API client with lazy initialization
import OpenAI from 'openai';

let openaiClient = null;
let isInitialized = false;

// Lazy initialize OpenAI client
function getOpenAIClient() {
  if (!isInitialized) {
    const apiKey = process.env.OPENAI_API_KEY;
    const isDevelopment = !apiKey || apiKey.includes('placeholder');

    console.log('🔑 Initializing OpenAI Client...');
    console.log('  API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'NOT SET');
    console.log('  Production Mode:', !isDevelopment);

    if (!isDevelopment) {
      openaiClient = new OpenAI({ apiKey });
      console.log('✅ OpenAI client initialized successfully!');
    } else {
      console.warn('⚠️  OpenAI running in DEMO MODE - no API key configured');
    }

    isInitialized = true;
  }

  return openaiClient;
}

// Generate embeddings for text
export async function generateEmbedding(text) {
  const client = getOpenAIClient();

  if (!client) {
    console.warn('⚠️  OpenAI API key not configured - using mock embedding');
    return Array(1536).fill(0).map(() => Math.random());
  }

  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float"
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

// Generate chat completion
export async function generateChatCompletion(messages, options = {}) {
  const client = getOpenAIClient();

  if (!client) {
    console.warn('⚠️  OpenAI API key not configured');
    return 'Demo Mode: Please configure your OpenAI API key to enable AI features. Get your key at https://platform.openai.com/api-keys';
  }

  try {
    const response = await client.chat.completions.create({
      model: options.model || "gpt-4o",
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1500,
      ...options
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw new Error('Failed to generate response');
  }
}

// Vision API for homework solver
export async function analyzeImage(imageBase64, prompt) {
  const client = getOpenAIClient();

  if (!client) {
    console.warn('⚠️  OpenAI API key not configured');
    return '**Demo Mode**\n\nThis is a placeholder response. To get real homework solutions:\n\n1. Get OpenAI API key from https://platform.openai.com/api-keys\n2. Add it to backend/.env as OPENAI_API_KEY\n3. Restart the server\n\nThe AI will then analyze your homework image and provide step-by-step solutions!';
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            },
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ],
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
}
