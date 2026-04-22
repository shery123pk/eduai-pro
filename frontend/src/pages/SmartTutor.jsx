import { useState } from 'react';
import Navbar from '../components/Navbar';
import UrduToggle from '../components/UrduToggle';
import MathRenderer from '../components/MathRenderer';
import LoadingSpinner from '../components/LoadingSpinner';
import { tutorAPI } from '../utils/api';
import toast from 'react-hot-toast';

const SmartTutor = () => {
  const [subject, setSubject] = useState('mathematics');
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('english');
  const [answer, setAnswer] = useState('');
  const [detectedSubject, setDetectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: '➕' },
    { id: 'physics', name: 'Physics', icon: '⚛️' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
    { id: 'biology', name: 'Biology', icon: '🧬' },
    { id: 'english', name: 'English', icon: '📖' },
    { id: 'computer science', name: 'Computer Science', icon: '💻' }
  ];

  const exampleQuestions = {
    mathematics: [
      'Solve for x: 2x + 5 = 15',
      'What is the quadratic formula?',
      'Explain the Pythagorean theorem'
    ],
    physics: [
      'What is Newton\'s second law?',
      'Explain the concept of energy',
      'What is the difference between speed and velocity?'
    ],
    chemistry: [
      'What is the pH scale?',
      'Explain ionic bonding',
      'What is the periodic table?'
    ],
    english: [
      'What is a metaphor?',
      'Explain the difference between "affect" and "effect"',
      'What are the parts of speech?'
    ]
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    setAnswer('');

    try {
      const response = await tutorAPI.ask({
        subject,
        question,
        language
      });

      setAnswer(response.data.answer);
      setDetectedSubject(response.data.subject);
    } catch (error) {
      toast.error('Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Smart Tutor</h1>
            <p className="text-slate-400">Get personalized help from AI tutors</p>
          </div>
          <UrduToggle isUrdu={language === 'urdu'} onToggle={() => setLanguage(language === 'english' ? 'urdu' : 'english')} />
        </div>

        {/* Subject Tabs */}
        <div className="glassmorphism p-4 rounded-xl mb-6">
          <div className="flex flex-wrap gap-3">
            {subjects.map((subj) => (
              <button
                key={subj.id}
                onClick={() => {
                  setSubject(subj.id);
                  setAnswer('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  subject === subj.id
                    ? 'gradient-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span>{subj.icon}</span>
                <span>{subj.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Question Input */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glassmorphism p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">Ask a Question</h3>

              <form onSubmit={handleAsk} className="space-y-4">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={
                    language === 'urdu'
                      ? 'اپنا سوال یہاں لکھیں...'
                      : 'Type your question here...'
                  }
                  className={`input-field h-32 resize-none ${language === 'urdu' ? 'text-right font-urdu' : ''}`}
                />

                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="w-full btn-primary py-3"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Thinking...</span>
                    </div>
                  ) : language === 'urdu' ? (
                    '📚 جواب حاصل کریں'
                  ) : (
                    '📚 Get Answer'
                  )}
                </button>
              </form>
            </div>

            {/* Example Questions */}
            <div className="glassmorphism p-6 rounded-xl">
              <h4 className="text-sm font-bold text-slate-400 mb-3">Example Questions:</h4>
              <div className="space-y-2">
                {(exampleQuestions[subject] || []).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuestion(q)}
                    className="w-full text-left px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Answer */}
          <div className="lg:col-span-3">
            <div className="glassmorphism p-6 rounded-xl min-h-[500px]">
              <h3 className="text-lg font-bold text-white mb-4">Answer</h3>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <LoadingSpinner size="lg" message="Generating answer..." />
                </div>
              ) : answer ? (
                <div className={`space-y-4 ${language === 'urdu' ? 'text-right font-urdu' : ''}`}>
                  {detectedSubject && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full text-sm text-primary">
                      <span>Detected: {detectedSubject}</span>
                    </div>
                  )}

                  <MathRenderer content={answer} />

                  <div className="pt-4 border-t border-slate-600 flex gap-3">
                    <button
                      onClick={() => navigator.clipboard.writeText(answer)}
                      className="btn-secondary flex-1"
                    >
                      📋 Copy Answer
                    </button>
                    <button
                      onClick={() => {
                        setQuestion('');
                        setAnswer('');
                      }}
                      className="btn-outline flex-1"
                    >
                      ✨ New Question
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h4 className="text-xl font-bold text-white mb-2">Ready to Help!</h4>
                  <p className="text-slate-400 max-w-md">
                    Ask any question about {subjects.find((s) => s.id === subject)?.name} and I'll provide a detailed explanation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SmartTutor;
