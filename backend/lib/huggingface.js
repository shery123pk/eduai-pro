// HuggingFace API integration
import axios from 'axios';

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Zero-shot classification for subject detection
export async function classifySubject(text) {
  try {
    const response = await axios.post(
      `${HF_API_URL}/facebook/bart-large-mnli`,
      {
        inputs: text,
        parameters: {
          candidate_labels: [
            'mathematics',
            'physics',
            'chemistry',
            'biology',
            'english',
            'history',
            'computer science',
            'urdu',
            'general science'
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data;

    // Return top prediction
    return {
      subject: result.labels[0],
      confidence: result.scores[0],
      allPredictions: result.labels.map((label, idx) => ({
        subject: label,
        confidence: result.scores[idx]
      }))
    };
  } catch (error) {
    console.error('Error classifying subject:', error.response?.data || error.message);
    // Fallback to general if API fails
    return {
      subject: 'general',
      confidence: 0.5,
      allPredictions: []
    };
  }
}

// Analyze weak areas using text classification
export async function analyzeWeakAreas(studentPerformanceText) {
  try {
    const response = await axios.post(
      `${HF_API_URL}/facebook/bart-large-mnli`,
      {
        inputs: studentPerformanceText,
        parameters: {
          candidate_labels: [
            'needs practice with basics',
            'struggling with advanced concepts',
            'good understanding',
            'excellent performance',
            'needs more examples',
            'confused about fundamentals'
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error analyzing weak areas:', error.response?.data || error.message);
    return null;
  }
}

// Text summarization for long content
export async function summarizeText(text) {
  try {
    const response = await axios.post(
      `${HF_API_URL}/facebook/bart-large-cnn`,
      {
        inputs: text,
        parameters: {
          max_length: 150,
          min_length: 30
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data[0].summary_text;
  } catch (error) {
    console.error('Error summarizing text:', error.response?.data || error.message);
    return text.substring(0, 200) + '...'; // Fallback
  }
}
