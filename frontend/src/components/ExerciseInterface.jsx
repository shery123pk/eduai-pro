import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const masteryInfo = {
  not_started: { color: 'text-zinc-400', bg: 'bg-zinc-800', icon: '○', label: 'Not Started' },
  attempted: { color: 'text-red-400', bg: 'bg-red-900/40', icon: '↻', label: 'Attempted' },
  familiar: { color: 'text-yellow-400', bg: 'bg-yellow-900/40', icon: '◑', label: 'Familiar (50pts)' },
  proficient: { color: 'text-blue-400', bg: 'bg-blue-900/40', icon: '◕', label: 'Proficient (80pts)' },
  mastered: { color: 'text-green-400', bg: 'bg-green-900/40', icon: '●', label: 'Mastered (100pts)' }
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
      <div className="glass-card rounded-3xl p-12 border border-white/10 text-center">
        <div className="loader-modern mb-4 mx-auto"></div>
        <p className="text-zinc-400">Loading exercise...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="glass-card rounded-3xl p-12 border border-white/10 text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-zinc-400">Exercise not found</p>
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
        <div className="glass-card rounded-3xl p-8 border border-white/10 text-center">
          <div className="text-8xl mb-4">
            {results.score === 100 ? '🎉' : results.score >= 70 ? '👍' : '💪'}
          </div>
          <div className="text-7xl font-black text-white mb-2">{results.score}%</div>
          <p className="text-zinc-400 text-lg">{results.correctCount} of {results.totalQuestions} correct</p>

          {/* Mastery Badge */}
          <div className={`inline-flex items-center gap-3 mt-6 px-6 py-3 rounded-2xl ${mastery.bg} border border-white/10`}>
            <span className="text-3xl">{mastery.icon}</span>
            <div className="text-left">
              <div className={`font-black text-lg ${mastery.color}`}>{mastery.label}</div>
              {improved && (
                <div className="text-zinc-400 text-sm">
                  ↑ From {masteryInfo[results.previousMasteryLevel]?.label || 'Not Started'}
                </div>
              )}
            </div>
          </div>

          <p className="text-zinc-300 mt-4 font-medium">{results.message}</p>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={handleRetry} className="px-6 py-3 glass-card border border-white/20 text-white font-bold rounded-2xl hover:border-blue-500/50 transition-all">
              Try Again
            </button>
            {results.score < 100 && (
              <button
                onClick={() => { setCurrentQ(0); setPhase('review'); }}
                className="btn-cyber px-6 py-3"
              >
                Review Answers
              </button>
            )}
          </div>
        </div>

        {/* Mastery Path */}
        <div className="glass-card rounded-3xl p-6 border border-white/10">
          <h3 className="text-lg font-black text-white mb-4">Mastery Progression</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {['not_started', 'attempted', 'familiar', 'proficient', 'mastered'].map((level, idx, arr) => {
              const info = masteryInfo[level];
              const isCurrent = level === results.masteryLevel;
              const isPast = arr.indexOf(level) < arr.indexOf(results.masteryLevel);
              return (
                <div key={level} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    isCurrent ? `${info.bg} border-white/30` :
                    isPast ? 'bg-green-900/20 border-green-500/30' :
                    'bg-zinc-900 border-zinc-800'
                  }`}>
                    <span className={`${isPast || isCurrent ? info.color : 'text-zinc-600'} font-bold`}>
                      {info.icon}
                    </span>
                    <span className={`text-sm font-medium ${isCurrent ? 'text-white' : isPast ? info.color : 'text-zinc-600'}`}>
                      {info.label.split('(')[0].trim()}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-zinc-500 text-sm mt-3">
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

        <div className="glass-card rounded-3xl p-8 border border-white/10">
          {/* Question */}
          <h3 className="text-2xl font-black text-white mb-6">
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
                      ? 'bg-green-900/30 border-green-500 text-green-300'
                      : isUserAnswer && !isCorrect
                      ? 'bg-red-900/30 border-red-500 text-red-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isCorrectAnswer ? 'bg-green-500 text-white' :
                    isUserAnswer && !isCorrect ? 'bg-red-500 text-white' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isCorrectAnswer ? '✓' : isUserAnswer && !isCorrect ? '✗' : option[0]}
                  </div>
                  <span className="font-medium">{option}</span>
                  {isCorrectAnswer && <span className="ml-auto text-green-400 font-bold text-sm">Correct Answer</span>}
                  {isUserAnswer && !isCorrect && <span className="ml-auto text-red-400 font-bold text-sm">Your Answer</span>}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {resultForQ && (
            <div className={`p-4 rounded-2xl border ${
              isCorrect ? 'bg-green-900/20 border-green-500/30' : 'bg-blue-900/20 border-blue-500/30'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{isCorrect ? '✅' : '💡'}</span>
                <div>
                  <div className={`font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-blue-400'}`}>
                    {isCorrect ? 'Correct!' : 'Explanation'}
                  </div>
                  <p className="text-zinc-300 text-sm">{resultForQ.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQ > 0 && (
            <button onClick={() => setCurrentQ(q => q - 1)} className="glass-card border border-white/20 text-white font-bold px-5 py-3 rounded-2xl hover:border-white/40 transition-all">
              ← Prev
            </button>
          )}
          {currentQ < totalQuestions - 1 ? (
            <button onClick={() => setCurrentQ(q => q + 1)} className="btn-cyber flex-1 px-5 py-3">
              Next Question →
            </button>
          ) : (
            <button onClick={() => setPhase('complete')} className="btn-cyber flex-1 px-5 py-3">
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
      <div className="glass-card rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold text-sm">{exercise.title}</span>
          <span className="text-zinc-400 text-sm">Question {currentQ + 1} of {totalQuestions}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentQ) / totalQuestions) * 100}%` }}
          />
        </div>
        {progress && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-bold ${masteryInfo[progress.masteryLevel]?.color || 'text-zinc-400'}`}>
              {masteryInfo[progress.masteryLevel]?.icon} {masteryInfo[progress.masteryLevel]?.label || 'Not Started'}
            </span>
            {progress.bestScore > 0 && (
              <span className="text-xs text-zinc-500">· Best: {progress.bestScore}%</span>
            )}
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="glass-card rounded-3xl p-8 border border-white/10 animate-fade-scale">
        <div className="mb-6">
          <div className="text-sm font-bold text-blue-400 mb-3">Question {currentQ + 1}</div>
          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
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
                    ? 'border-blue-500 bg-blue-900/30 text-white shadow-lg shadow-blue-500/20'
                    : 'border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {labels[idx]}
                </div>
                <span className="text-lg">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Hint Section */}
        <div className="border-t border-white/10 pt-4">
          {!showHint ? (
            <button
              onClick={() => fetchHint(question.id)}
              className="text-sm text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-2 transition-colors"
            >
              <span>💡</span>
              <span>Need a hint? (marks as used)</span>
            </button>
          ) : (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="flex-1">
                  <div className="text-yellow-400 font-bold text-sm mb-1">
                    Hint {hintLevels[question.id] || 1}
                  </div>
                  <p className="text-zinc-300 text-sm">{currentHints[question.id]}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHint(false);
                  fetchHint(question.id);
                }}
                className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
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
            className="glass-card border border-white/20 text-white font-bold px-5 py-3 rounded-2xl hover:border-white/40 transition-all"
          >
            ← Back
          </button>
        )}

        {currentQ < totalQuestions - 1 ? (
          <button
            onClick={() => {
              if (!answers[question.id]) {
                toast.error('Please select an answer first');
                return;
              }
              setCurrentQ(q => q + 1);
              setShowHint(false);
            }}
            disabled={!answers[question.id]}
            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
              answers[question.id]
                ? 'btn-cyber'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Next Question →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < totalQuestions}
            className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
              !submitting && answeredCount === totalQuestions
                ? 'btn-cyber'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Submitting...' : `Submit Exercise (${answeredCount}/${totalQuestions})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExerciseInterface;
