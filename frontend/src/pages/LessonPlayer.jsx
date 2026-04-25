import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExerciseInterface from '../components/ExerciseInterface';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('video');
  const [videoWatched, setVideoWatched] = useState(false);
  const [notes, setNotes] = useState('');
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [exerciseResult, setExerciseResult] = useState(null);

  useEffect(() => {
    fetchLesson();
    const saved = localStorage.getItem(`notes-${lessonId}`);
    if (saved) setNotes(saved);
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/curriculum/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLesson(response.data.lesson);
    } catch (error) {
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = (result) => {
    setExerciseCompleted(true);
    setExerciseResult(result);
    toast.success(`Exercise completed! Score: ${result.score}%`);
  };

  const getMasteryBadge = (level) => {
    const badges = {
      mastered:   { icon: '🏆', color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Mastered' },
      proficient: { icon: '⭐', color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200',   label: 'Proficient' },
      familiar:   { icon: '👍', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'Familiar' },
      attempted:  { icon: '💪', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Attempted' },
    };
    return badges[level] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ultra-modern flex items-center justify-center">
        <div className="text-center">
          <div className="loader-modern mb-4 mx-auto"></div>
          <p className="text-slate-500 font-medium">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-ultra-modern flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-12 border border-slate-200 shadow-lg">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Lesson Not Found</h2>
          <Link to="/student/courses" className="btn-cyber mt-4 inline-block">Back to Courses</Link>
        </div>
      </div>
    );
  }

  const videoUrlWithParams = lesson.videoUrl
    ? `${lesson.videoUrl}?rel=0&modestbranding=1&color=white`
    : null;

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <Link to="/student/courses" className="hover:text-indigo-600 transition-colors">Courses</Link>
          <span>/</span>
          <span className="text-slate-700 font-bold">{lesson.title}</span>
        </div>

        {/* Lesson Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl uppercase">
                  {lesson.type === 'video' ? '🎬 Video Lesson' : '📖 Article'}
                </span>
                {lesson.duration && (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-xl">⏱️ {lesson.duration} min</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">{lesson.title}</h1>
              <p className="text-slate-500 mt-1 font-medium">{lesson.description}</p>
            </div>

            {/* Progress indicators */}
            <div className="flex gap-3">
              <div className={`flex flex-col items-center p-3 rounded-2xl border-2 ${videoWatched ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-2xl">{videoWatched ? '✅' : '🎬'}</span>
                <span className="text-xs font-bold text-slate-500 mt-1">Video</span>
              </div>
              {lesson.hasExercise && (
                <div className={`flex flex-col items-center p-3 rounded-2xl border-2 ${exerciseCompleted ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-2xl">{exerciseCompleted ? '✅' : '✏️'}</span>
                  <span className="text-xs font-bold text-slate-500 mt-1">Practice</span>
                </div>
              )}
            </div>
          </div>

          {/* Exercise Result Banner */}
          {exerciseCompleted && exerciseResult && (() => {
            const badge = getMasteryBadge(exerciseResult.masteryLevel);
            return (
              <div className={`mt-4 p-4 rounded-2xl border-2 ${badge?.bg || 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{badge?.icon}</span>
                  <div>
                    <div className={`font-black text-lg ${badge?.color || 'text-green-600'}`}>
                      {exerciseResult.message}
                    </div>
                    <div className="text-slate-500 text-sm font-medium">
                      Score: {exerciseResult.score}% ({exerciseResult.correctCount}/{exerciseResult.totalQuestions} correct)
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {[
            { id: 'video', label: lesson.type === 'video' ? '🎬 Video' : '📖 Article' },
            ...(lesson.hasExercise ? [{ id: 'exercise', label: '✏️ Practice' }] : []),
            { id: 'notes', label: '📝 Notes' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {tab.label}
              {tab.id === 'exercise' && exerciseCompleted && ' ✅'}
            </button>
          ))}
        </div>

        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            {lesson.type === 'video' ? (
              <>
                {/* Video Player */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                    {videoUrlWithParams ? (
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={videoUrlWithParams}
                        title={lesson.title}
                        frameBorder="0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <p>Video not available</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-slate-50">
                    <div className="text-sm text-slate-500 font-medium">
                      Watch the full video then mark as complete
                    </div>
                    <div className="flex gap-2">
                      {lesson.youtubeId && (
                        <a
                          href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl font-bold text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                        >
                          ▶ Open in YouTube
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setVideoWatched(true);
                          toast.success('Video marked as watched!');
                          if (lesson.hasExercise) setTimeout(() => setActiveTab('exercise'), 500);
                        }}
                        className={`px-5 py-2 rounded-xl font-black text-sm transition-all ${
                          videoWatched
                            ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:opacity-90'
                        }`}
                      >
                        {videoWatched ? '✅ Watched' : 'Mark as Watched'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                {lesson.transcript && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                      <span>📄</span> Lesson Transcript
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-medium">{lesson.transcript}</p>
                  </div>
                )}
              </>
            ) : (
              /* Article Content */
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <p className="text-slate-700 leading-relaxed text-base font-medium">{lesson.transcript || lesson.description}</p>
                <button
                  onClick={() => {
                    setVideoWatched(true);
                    toast.success('Article marked as read!');
                  }}
                  className={`mt-6 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                    videoWatched
                      ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  }`}
                >
                  {videoWatched ? '✅ Read' : 'Mark as Read'}
                </button>
              </div>
            )}

            {/* Next Step CTA */}
            {lesson.hasExercise && videoWatched && !exerciseCompleted && (
              <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 bg-indigo-50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Ready to Practice?</h3>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Test your understanding with interactive exercises</p>
                  </div>
                  <button onClick={() => setActiveTab('exercise')} className="btn-cyber px-6 py-3">
                    Start Practice →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exercise Tab */}
        {activeTab === 'exercise' && lesson.hasExercise && (
          <ExerciseInterface exerciseId={lesson.exerciseId} onComplete={handleExerciseComplete} />
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <span>📝</span> Your Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes as you watch the video or read the article..."
              className="w-full h-64 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none text-sm leading-relaxed font-medium"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  localStorage.setItem(`notes-${lessonId}`, notes);
                  toast.success('Notes saved!');
                }}
                className="btn-cyber px-5 py-2.5 text-sm"
              >
                Save Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPlayer;
