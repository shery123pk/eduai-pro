import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const masteryInfo = {
  not_started: { color: 'text-slate-400', bg: 'bg-slate-100', icon: '○', label: 'Not Started' },
  attempted:   { color: 'text-red-500',   bg: 'bg-red-50',    icon: '↻', label: 'Attempted' },
  familiar:    { color: 'text-amber-500', bg: 'bg-amber-50',  icon: '◑', label: 'Familiar (50pts)' },
  proficient:  { color: 'text-blue-500',  bg: 'bg-blue-50',   icon: '◕', label: 'Proficient (80pts)' },
  mastered:    { color: 'text-green-500', bg: 'bg-green-50',  icon: '●', label: 'Mastered (100pts)' }
};

const ExerciseInterface = ({ exerciseId, onComplete }) => {
  const [exercise, setExercise] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hintsUsed, setHintsUsed] = useState({});
  const [hintLevels, setHintLevels] = useState({});
  const [currentHints, setCurrentHints] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [phase, setPhase] = useState('quiz'); // 'quiz' | 'review' | 'complete'

  useEffect(() => {
    if (exerciseId) fetchExercise();
  }, [exerciseId]);

  const fetchExercise = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/exercises/${exerciseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercise(response.data.exercise);
      setProgress(response.data.progress);
    } catch (error) {
      console.error('Error fetching exercise:', error);
      toast.error('Failed to load exercise');
    } finally {
      setLoading(false);
    }
  };

  const fetchHint = async (questionId) => {
    const currentHintLevel = hintLevels[questionId] ?? 0;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/exercises/${exerciseId}/hint`,
        { questionId, hintLevel: currentHintLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentHints(prev => ({ ...prev, [questionId]: response.data.hint }));
      setHintLevels(prev => ({ ...prev, [questionId]: currentHintLevel + 1 }));
      setHintsUsed(prev => ({ ...prev, [questionId]: true }));
      setShowHint(true);
    } catch (error) {
      console.error('Error fetching hint:', error);
      toast.error('Failed to load hint');
    }
  };

  const handleSelectAnswer = (questionId, answer) => {
    if (submitted) return;
    setSelectedAnswer(answer);
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < exercise.questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/exercises/${exerciseId}/submit`,
        { answers, hintsUsed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(response.data);
      setSubmitted(true);
      setPhase('review');
      onComplete && onComplete(response.data);
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Failed to submit exercise');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setHintsUsed({});
    setHintLevels({});
    setCurrentHints({});
    setShowHint(false);
    setSubmitted(false);
    setResults(null);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setPhase('quiz');
    fetchExercise();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center shadow-sm">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading exercise...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center shadow-sm">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-slate-500 font-medium">Exercise not found</p>
      </div>
    );
  }

  const question = exercise.questions[currentQ];
  const totalQuestions = exercise.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // ---- RESULTS SCREEN ----
  if (phase === 'complete' || (submitted && results && phase === 'review' && currentQ >= totalQuestions)) {
    const mastery = masteryInfo[results.masteryLevel] || masteryInfo.attempted;
    const improved = results.masteryLevel !== results.previousMasteryLevel;

    return (
      <div className="space-y-6 animate-fade-scale">
        {/* Score Card */}
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm text-center">
          <div className="text-8xl mb-4">
            {results.score === 100 ? '🎉' : results.score >= 70 ? '👍' : '💪'}
          </div>
          <div className="text-7xl font-black text-slate-900 mb-2">{results.score}%</div>
          <p className="text-slate-500 text-lg">{results.correctCount} of {results.totalQuestions} correct</p>

          {/* Mastery Badge */}
          <div className={`inline-flex items-center gap-3 mt-6 px-6 py-3 rounded-2xl ${mastery.bg} border border-slate-200`}>
            <span className="text-3xl">{mastery.icon}</span>
            <div className="text-left">
              <div className={`font-black text-lg ${mastery.color}`}>{mastery.label}</div>
              {improved && (
                <div className="text-slate-500 text-sm">
                  ↑ From {masteryInfo[results.previousMasteryLevel]?.label || 'Not Started'}
                </div>
              )}
            </div>
          </div>

          <p className="text-slate-600 mt-4 font-medium">{results.message}</p>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={handleRetry} className="px-6 py-3 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">
              Try Again
            </button>
            {results.score < 100 && (
              <button
                onClick={() => { setCurrentQ(0); setPhase('review'); }}
                className="px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
              >
                Review Answers
              </button>
            )}
          </div>
        </div>

        {/* Mastery Path */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-4">Mastery Progression</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {['not_started', 'attempted', 'familiar', 'proficient', 'mastered'].map((level, idx, arr) => {
              const info = masteryInfo[level];
              const isCurrent = level === results.masteryLevel;
              const isPast = arr.indexOf(level) < arr.indexOf(results.masteryLevel);
              return (
                <div key={level} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    isCurrent ? `${info.bg} border-indigo-200` :
                    isPast ? 'bg-green-50 border-green-200' :
                    'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`${isPast || isCurrent ? info.color : 'text-slate-400'} font-bold`}>
                      {info.icon}
                    </span>
                    <span className={`text-sm font-medium ${isCurrent ? 'text-slate-800' : isPast ? info.color : 'text-slate-400'}`}>
                      {info.label.split('(')[0].trim()}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-slate-500 text-sm mt-3">
            {results.masteryLevel === 'mastered'
              ? '🎉 You have mastered this skill!'
              : `Score 100% to reach the next mastery level. ${results.masteryPoints > 0 ? `Earned ${results.masteryPoints} mastery points.` : ''}`}
          </p>
        </div>
      </div>
    );
  }

  // ---- REVIEW SCREEN ----
  if (phase === 'review' && submitted && results) {
    const resultForQ = results.results[currentQ];
    const isCorrect = resultForQ?.correct && !resultForQ?.usedHint;

    return (
      <div className="space-y-4 animate-fade-scale">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400 text-sm">Review Question {currentQ + 1} of {totalQuestions}</span>
          <span className="text-zinc-400 text-sm">Score: {results.score}%</span>
        </div>

        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm">
          {/* Question */}
          <h3 className="text-2xl font-black text-slate-900 mb-6">
            {exercise.questions[currentQ].question}
          </h3>

          {/* Options with results */}
          <div className="space-y-3 mb-6">
            {exercise.questions[currentQ].options.map(option => {
              const isUserAnswer = resultForQ?.userAnswer === option;
              const isCorrectAnswer = resultForQ?.correctAnswer === option;

              return (
                <div
                  key={option}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
                    isCorrectAnswer
                      ? 'bg-green-50 border-green-400 text-green-800'
                      : isUserAnswer && !isCorrect
                      ? 'bg-red-50 border-red-400 text-red-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isCorrectAnswer ? 'bg-green-500 text-white' :
                    isUserAnswer && !isCorrect ? 'bg-red-500 text-white' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {isCorrectAnswer ? '✓' : isUserAnswer && !isCorrect ? '✗' : option[0]}
                  </div>
                  <span className="font-medium">{option}</span>
                  {isCorrectAnswer && <span className="ml-auto text-green-600 font-bold text-sm">Correct Answer</span>}
                  {isUserAnswer && !isCorrect && <span className="ml-auto text-red-600 font-bold text-sm">Your Answer</span>}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {resultForQ && (
            <div className={`p-4 rounded-2xl border ${
              isCorrect ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{isCorrect ? '✅' : '💡'}</span>
                <div>
                  <div className={`font-bold mb-1 ${isCorrect ? 'text-green-700' : 'text-blue-700'}`}>
                    {isCorrect ? 'Correct!' : 'Explanation'}
                  </div>
                  <p className="text-slate-700 text-sm">{resultForQ.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQ > 0 && (
            <button onClick={() => setCurrentQ(q => q - 1)} className="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl hover:bg-slate-200 transition-all">
              ← Prev
            </button>
          )}
          {currentQ < totalQuestions - 1 ? (
            <button onClick={() => setCurrentQ(q => q + 1)} className="flex-1 px-5 py-3 rounded-2xl font-bold text-white transition-all" style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
              Next Question →
            </button>
          ) : (
            <button onClick={() => setPhase('complete')} className="flex-1 px-5 py-3 rounded-2xl font-bold text-white transition-all" style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
              View Final Score →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---- QUIZ SCREEN ----
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-900 font-bold text-sm">{exercise.title}</span>
          <span className="text-slate-500 text-sm">Question {currentQ + 1} of {totalQuestions}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentQ) / totalQuestions) * 100}%` }}
          />
        </div>
        {progress && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-bold ${masteryInfo[progress.masteryLevel]?.color || 'text-slate-400'}`}>
              {masteryInfo[progress.masteryLevel]?.icon} {masteryInfo[progress.masteryLevel]?.label || 'Not Started'}
            </span>
            {progress.bestScore > 0 && (
              <span className="text-xs text-slate-400">· Best: {progress.bestScore}%</span>
            )}
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm animate-fade-scale">
        <div className="mb-6">
          <div className="text-sm font-bold text-indigo-600 mb-3">Question {currentQ + 1}</div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {question.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => {
            const isSelected = answers[question.id] === option;
            const labels = ['A', 'B', 'C', 'D'];
            return (
              <button
                key={option}
                onClick={() => handleSelectAnswer(question.id, option)}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all font-medium ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-slate-900 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {labels[idx]}
                </div>
                <span className="text-lg">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Hint Section */}
        <div className="border-t border-slate-100 pt-4">
          {!showHint ? (
            <button
              onClick={() => fetchHint(question.id)}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 transition-colors"
            >
              <span>💡</span>
              <span>Need a hint? (marks as used)</span>
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="flex-1">
                  <div className="text-amber-700 font-bold text-sm mb-1">
                    Hint {hintLevels[question.id] || 1}
                  </div>
                  <p className="text-slate-700 text-sm">{currentHints[question.id]}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowHint(false); fetchHint(question.id); }}
                className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Show next hint →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentQ > 0 && (
          <button
            onClick={() => { setCurrentQ(q => q - 1); setShowHint(false); }}
            className="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl hover:bg-slate-200 transition-all"
          >
            ← Back
          </button>
        )}

        {currentQ < totalQuestions - 1 ? (
          <button
            onClick={() => {
              if (!answers[question.id]) { toast.error('Please select an answer first'); return; }
              setCurrentQ(q => q + 1);
              setShowHint(false);
            }}
            disabled={!answers[question.id]}
            className={`flex-1 py-3 rounded-2xl font-bold text-white transition-all ${
              answers[question.id] ? '' : 'opacity-40 cursor-not-allowed'
            }`}
            style={answers[question.id] ? { background: 'linear-gradient(135deg, #6366f1, #4338ca)' } : { background: '#94a3b8' }}
          >
            Next Question →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < totalQuestions}
            className="flex-1 py-3 rounded-2xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={!submitting && answeredCount === totalQuestions ? { background: 'linear-gradient(135deg, #6366f1, #4338ca)' } : { background: '#94a3b8' }}
          >
            {submitting ? 'Submitting...' : `Submit Exercise (${answeredCount}/${totalQuestions})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExerciseInterface;
