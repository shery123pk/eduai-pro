import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { quizAPI, coursesAPI } from '../utils/api';
import toast from 'react-hot-toast';

const QuizPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchQuizzes();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data.courses);
    } catch (error) {
      toast.error('Failed to load courses');
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getCourseQuizzes(selectedCourse);
      setQuizzes(response.data.quizzes);
    } catch (error) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId) => {
    setLoading(true);
    try {
      const response = await quizAPI.getQuiz(quizId);
      setActiveQuiz(response.data.quiz);
      setCurrentQuestion(0);
      setSelectedAnswers(new Array(response.data.quiz.questions.length).fill(null));
      setQuizResult(null);
    } catch (error) {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < activeQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    if (selectedAnswers.some((a) => a === null)) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setLoading(true);
    try {
      const response = await quizAPI.submit(activeQuiz.id, selectedAnswers);
      setQuizResult(response.data);
      toast.success(`Quiz completed! Score: ${response.data.score}%`);
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setQuizResult(null);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    fetchQuizzes();
  };

  if (quizResult) {
    // Results view
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto p-8 max-w-4xl">
          <div className="glassmorphism p-8 rounded-xl text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">{quizResult.score >= 70 ? '🎉' : '📚'}</div>
              <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
              <p className="text-slate-400">{activeQuiz.title}</p>
            </div>

            {/* Score */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-700"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - quizResult.score / 100)}`}
                  className={quizResult.score >= 70 ? 'text-green-500' : 'text-yellow-500'}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-5xl font-bold text-white">{quizResult.score}%</p>
                <p className="text-slate-400 text-sm">
                  {quizResult.correctCount}/{quizResult.totalQuestions}
                </p>
              </div>
            </div>

            {/* Results breakdown */}
            <div className="space-y-4 text-left mb-8">
              {quizResult.results.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    result.isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{result.isCorrect ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-2">Q{idx + 1}: {result.question}</p>
                      {!result.isCorrect && (
                        <p className="text-sm text-slate-300 mb-1">
                          Your answer: {activeQuiz.questions[idx].options[result.userAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-slate-400">{result.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={resetQuiz} className="btn-primary flex-1">
                Back to Quizzes
              </button>
              <button onClick={() => startQuiz(activeQuiz.id)} className="btn-outline flex-1">
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (activeQuiz) {
    // Quiz taking view
    const question = activeQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / activeQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto p-8 max-w-4xl">
          <div className="glassmorphism p-8 rounded-xl">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Question {currentQuestion + 1} of {activeQuiz.questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="gradient-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h3 className="text-2xl font-bold text-white mb-6">{question.question}</h3>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-4 rounded-lg font-medium transition-all ${
                    selectedAnswers[currentQuestion] === idx
                      ? 'gradient-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="mr-3">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {currentQuestion === activeQuiz.questions.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Submitting...' : 'Submit Quiz'}
                </button>
              ) : (
                <button onClick={handleNext} className="btn-primary">
                  Next →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz list view
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Quizzes</h1>
          <p className="text-slate-400">Test your knowledge with AI-generated quizzes</p>
        </div>

        {/* Course selector */}
        <div className="glassmorphism p-4 rounded-xl mb-6">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="input-field max-w-sm"
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" message="Loading quizzes..." />
          </div>
        ) : !selectedCourse ? (
          <div className="glassmorphism p-16 rounded-xl text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Select a Course</h3>
            <p className="text-slate-400">Choose a course to see available quizzes</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="glassmorphism p-16 rounded-xl text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">No Quizzes Available</h3>
            <p className="text-slate-400">Your teacher hasn't created any quizzes for this course yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="glassmorphism p-6 rounded-xl card-hover">
                <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                <p className="text-slate-400 text-sm mb-4">Topic: {quiz.topic}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-500">{quiz.question_count} questions</span>
                  <span className="text-xs text-slate-600">
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => startQuiz(quiz.id)}
                  className="w-full btn-primary"
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
