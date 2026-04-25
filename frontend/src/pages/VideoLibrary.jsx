import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { path: '/student', label: 'Home', icon: '🏠' },
  { path: '/student/courses', label: 'Courses', icon: '📚' },
  { path: '/student/mastery-coach', label: 'Mastery Coach', icon: '🧠' },
  { path: '/student/tools', label: 'AI Tools', icon: '🛠️' },
  { path: '/student/practice', label: 'AI Practice', icon: '🤖' },
  { path: '/student/chat', label: 'AI Chat', icon: '💬' },
  { path: '/student/homework', label: 'Homework', icon: '📝' },
  { path: '/student/quiz', label: 'Quizzes', icon: '📊' },
  { path: '/student/videos', label: 'Videos', icon: '🎬' },
  { path: '/student/gamification', label: 'Achievements', icon: '🏆' },
];

const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Entrepreneurship'];

const subjectColors = {
  Mathematics:      'bg-indigo-100 text-indigo-700 border-indigo-200',
  Physics:          'bg-purple-100 text-purple-700 border-purple-200',
  Chemistry:        'bg-green-100 text-green-700 border-green-200',
  Biology:          'bg-orange-100 text-orange-700 border-orange-200',
  English:          'bg-pink-100 text-pink-700 border-pink-200',
  Entrepreneurship: 'bg-amber-100 text-amber-700 border-amber-200',
};

function getYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&\s]+)/);
  return match?.[1] || null;
}

function getEmbedUrl(url) {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=1` : null;
}

const STORAGE_KEY  = 'eduai_videos';
const STORAGE_VER  = 'eduai_videos_v3'; // bump version → forces refresh of stored videos

const defaultVideos = [
  // ── Mathematics ──
  { id: 1,  title: 'Introduction to Algebra',              subject: 'Mathematics',      url: 'https://www.youtube.com/watch?v=NybHckSEQBI', description: 'Khan Academy — learn the basics of variables and algebraic expressions', addedBy: 'Admin' },
  { id: 2,  title: 'Essence of Calculus — Ch.1',           subject: 'Mathematics',      url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM', description: '3Blue1Brown — beautiful visual introduction to calculus concepts', addedBy: 'Admin' },
  { id: 3,  title: 'Statistics & Probability Intro',       subject: 'Mathematics',      url: 'https://www.youtube.com/watch?v=OmJ-4B-mS-Y', description: 'CrashCourse — introduction to statistics and probability', addedBy: 'Admin' },
  { id: 4,  title: 'Algebra Basics — Equations',           subject: 'Mathematics',      url: 'https://www.youtube.com/watch?v=l3XzepN03KQ', description: 'Khan Academy — solving one-step and two-step equations', addedBy: 'Admin' },
  { id: 5,  title: 'Linear Equations Explained',           subject: 'Mathematics',      url: 'https://www.youtube.com/watch?v=MXV65i9g1Xg', description: 'Khan Academy — graphing and solving linear equations', addedBy: 'Admin' },

  // ── Physics ──
  { id: 6,  title: 'Physics — Motion & Kinematics',        subject: 'Physics',          url: 'https://www.youtube.com/watch?v=ZM8ECpBuQYE', description: 'CrashCourse Physics #1 — speed, velocity, acceleration explained', addedBy: 'Admin' },
  { id: 7,  title: 'Vectors & 2D Motion',                  subject: 'Physics',          url: 'https://www.youtube.com/watch?v=w3BhzYI6zXU', description: 'CrashCourse Physics #4 — vectors, motion in 2 dimensions', addedBy: 'Admin' },
  { id: 8,  title: "Newton's Laws of Motion",              subject: 'Physics',          url: 'https://www.youtube.com/watch?v=kKKM8Y-u7ds', description: 'All three fundamental laws of motion explained clearly', addedBy: 'Admin' },
  { id: 9,  title: 'Work, Energy & Power',                 subject: 'Physics',          url: 'https://www.youtube.com/watch?v=w4QFJb9a8vo', description: 'CrashCourse Physics #9 — work, energy, and conservation', addedBy: 'Admin' },
  { id: 10, title: 'Waves & Sound Explained',              subject: 'Physics',          url: 'https://www.youtube.com/watch?v=TfYCnOvNnFU', description: 'CrashCourse Physics #17 — traveling waves, frequency, amplitude and wave behavior', addedBy: 'Admin' },

  // ── Chemistry ──
  { id: 11, title: 'Chemistry — Intro to the Subject',     subject: 'Chemistry',        url: 'https://www.youtube.com/watch?v=uVFCOfSuPTo', description: 'CrashCourse Chemistry #1 — what is chemistry and why it matters', addedBy: 'Admin' },
  { id: 12, title: 'The Periodic Table of Elements',       subject: 'Chemistry',        url: 'https://www.youtube.com/watch?v=0RRVV4Diomg', description: 'Elements, groups, periods and how to read the periodic table', addedBy: 'Admin' },
  { id: 13, title: 'Chemical Reactions & Equations',       subject: 'Chemistry',        url: 'https://www.youtube.com/watch?v=SjQG3rKSZUQ', description: 'CrashCourse Chemistry #3 — reactions, balancing equations', addedBy: 'Admin' },
  { id: 14, title: 'Acids, Bases & the pH Scale',          subject: 'Chemistry',        url: 'https://www.youtube.com/watch?v=LS67vS10O5Y', description: 'Understanding acids, bases and how pH is measured', addedBy: 'Admin' },

  // ── Biology ──
  { id: 15, title: 'Photosynthesis Explained',             subject: 'Biology',          url: 'https://www.youtube.com/watch?v=sQK3Yr4Sc_k', description: 'CrashCourse Biology #8 — how plants convert sunlight and CO₂ into food and oxygen', addedBy: 'Admin' },
  { id: 16, title: 'DNA Structure & Replication',          subject: 'Biology',          url: 'https://www.youtube.com/watch?v=8kK2zwjRV0M', description: 'CrashCourse Biology #10 — DNA structure, base pairs and how DNA replicates itself', addedBy: 'Admin' },
  { id: 17, title: 'Cell Biology — Intro',                 subject: 'Biology',          url: 'https://www.youtube.com/watch?v=tZE_fQFK8EY', description: 'CrashCourse Biology #1 — introduction to biology, characteristics of life and cells', addedBy: 'Admin' },
  { id: 18, title: 'Human Digestive System',               subject: 'Biology',          url: 'https://www.youtube.com/watch?v=s06XzaKqELk', description: 'CrashCourse Biology #28 — how food is broken down, absorbed and processed', addedBy: 'Admin' },
  { id: 19, title: 'Evolution & Natural Selection',        subject: 'Biology',          url: 'https://www.youtube.com/watch?v=GhHOjC4oxh8', description: "Darwin's theory of evolution and how natural selection works", addedBy: 'Admin' },

  // ── English ──
  { id: 20, title: 'English Grammar — Parts of Speech',   subject: 'English',          url: 'https://www.youtube.com/watch?v=0l69KEx7GQo', description: 'All 8 parts of speech explained with examples — nouns, verbs, adjectives, adverbs and more', addedBy: 'Admin' },
  { id: 21, title: 'How to Write a Great Essay',          subject: 'English',          url: 'https://www.youtube.com/watch?v=KlgR1q3UQZE', description: 'CrashCourse Study Skills #9 — how to plan, write and structure a strong essay', addedBy: 'Admin' },
  { id: 22, title: 'English Punctuation Rules',           subject: 'English',          url: 'https://www.youtube.com/watch?v=RPL8iij1X2A', description: 'How to use punctuation correctly — commas, semicolons, apostrophes and colons explained', addedBy: 'Admin' },
  { id: 23, title: 'Public Speaking Confidence',          subject: 'English',          url: 'https://www.youtube.com/watch?v=tShavGuo0_E', description: 'How to speak confidently and effectively in front of others', addedBy: 'Admin' },

  // ── Entrepreneurship ──
  { id: 24, title: 'Entrepreneurship — Astolixgen',       subject: 'Entrepreneurship', url: 'https://youtu.be/B9T5TnClZoY', description: 'Business and entrepreneurship insights by Astolixgen', addedBy: 'Admin' },
];

export default function VideoLibrary() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@test.com' || user?.email === 'teacher@test.com';
  const playerRef = useRef(null);

  const [videos, setVideos] = useState(() => {
    try {
      // If new version flag not set → wipe old stored videos and use fresh defaults
      const isNewVersion = localStorage.getItem(STORAGE_VER);
      if (!isNewVersion) {
        localStorage.setItem(STORAGE_VER, '1');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVideos));
        return defaultVideos;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length < 24) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVideos));
          return defaultVideos;
        }
        return parsed;
      }
      return defaultVideos;
    } catch { return defaultVideos; }
  });

  const [filter,   setFilter]   = useState('All');
  const [playing,  setPlaying]  = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [form,     setForm]     = useState({ title: '', subject: 'Mathematics', url: '', description: '' });
  const [deleteId, setDeleteId] = useState(null);

  const saveVideos = (v) => {
    setVideos(v);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  };

  // Play a video and scroll the player into view
  const handlePlay = (id) => {
    setPlaying(id);
    // Small timeout so the player DOM node renders before we scroll
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const addVideo = () => {
    if (!form.title.trim() || !form.url.trim()) { toast.error('Title and URL are required'); return; }
    if (!getYouTubeId(form.url)) { toast.error('Please enter a valid YouTube URL'); return; }
    const newVideo = { id: Date.now(), ...form, addedBy: user?.name || 'Admin' };
    saveVideos([newVideo, ...videos]);
    setForm({ title: '', subject: 'Mathematics', url: '', description: '' });
    setShowAdd(false);
    toast.success('Video added!');
  };

  const deleteVideo = (id) => {
    saveVideos(videos.filter(v => v.id !== id));
    if (playing === id) setPlaying(null);
    setDeleteId(null);
    toast.success('Video removed');
  };

  const visible = filter === 'All' ? videos : videos.filter(v => v.subject === filter);

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-black text-slate-900">🎬 Video Library</h1>
                <p className="text-slate-500 font-medium mt-1">Educational videos curated by your teacher</p>
              </div>
              {isAdmin && (
                <button onClick={() => setShowAdd(!showAdd)}
                  className="px-5 py-3 rounded-xl font-black text-white text-sm shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' }}>
                  {showAdd ? '✕ Cancel' : '+ Add Video'}
                </button>
              )}
            </div>

            {/* Admin: Add Video Form */}
            {isAdmin && showAdd && (
              <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-slate-900">Add New Video</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Video Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                      placeholder="e.g. Introduction to Algebra"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400">
                      {subjects.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-black text-slate-700 mb-1.5">YouTube URL *</label>
                    <input value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400 transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Description (optional)</label>
                    <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                      placeholder="Brief description of the video..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400 transition-all" />
                  </div>
                </div>
                <button onClick={addVideo}
                  className="px-8 py-3 rounded-xl font-black text-white text-base shadow-md"
                  style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                  ✅ Add Video to Library
                </button>
              </div>
            )}

            {/* Subject filter */}
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
                    filter === s
                      ? 'text-white shadow-md'
                      : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                  style={filter === s ? { background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' } : {}}>
                  {s}
                </button>
              ))}
            </div>

            {/* ── VIDEO PLAYER (scroll target) ── */}
            {playing && (() => {
              const vid = videos.find(v => v.id === playing);
              const embed = vid ? getEmbedUrl(vid.url) : null;
              return vid && embed ? (
                <div ref={playerRef} className="bg-white border-2 border-indigo-300 rounded-2xl overflow-hidden shadow-lg scroll-mt-4">
                  <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={embed}
                      title={vid.title}
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{vid.title}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${subjectColors[vid.subject] || 'bg-slate-100 text-slate-600'}`}>
                        {vid.subject}
                      </span>
                      {vid.description && (
                        <p className="text-sm text-slate-500 mt-1">{vid.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setPlaying(null)}
                      className="px-5 py-2.5 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:border-red-300 hover:text-red-600 transition-all text-sm flex-shrink-0">
                      ✕ Close Player
                    </button>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Video grid */}
            {visible.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="text-5xl mb-3">🎬</div>
                <p className="font-black text-slate-600 text-lg">No videos in this subject yet.</p>
                {isAdmin && <p className="text-slate-400 mt-1">Use "Add Video" button to add videos.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visible.map(video => {
                  const thumbId = getYouTubeId(video.url);
                  const isPlaying = playing === video.id;
                  return (
                    <div key={video.id}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group ${
                        isPlaying
                          ? 'border-2 border-indigo-500 ring-2 ring-indigo-200'
                          : 'border-2 border-slate-200 hover:border-indigo-300'
                      }`}>
                      {/* Thumbnail */}
                      <div className="relative cursor-pointer" onClick={() => handlePlay(video.id)}>
                        {thumbId ? (
                          <img
                            src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-44 object-cover"
                            onError={e => {
                              e.target.src = `https://img.youtube.com/vi/${thumbId}/default.jpg`;
                              e.target.onerror = () => { e.target.style.display = 'none'; };
                            }}
                          />
                        ) : (
                          <div className="w-full h-44 bg-indigo-50 flex items-center justify-center text-5xl">🎬</div>
                        )}
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                            <span className="text-2xl ml-1">▶</span>
                          </div>
                        </div>
                        {isPlaying && (
                          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-black text-white" style={{ background: 'rgba(79,70,229,0.9)' }}>
                            ▶ NOW PLAYING
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-black text-slate-900 text-sm leading-tight group-hover:text-indigo-700 transition-colors">
                            {video.title}
                          </h3>
                          {isAdmin && (
                            <button onClick={() => setDeleteId(video.id)}
                              className="text-red-400 hover:text-red-600 text-lg flex-shrink-0 transition-colors">
                              🗑
                            </button>
                          )}
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${subjectColors[video.subject] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {video.subject}
                        </span>
                        {video.description && (
                          <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-2">{video.description}</p>
                        )}
                        <button
                          onClick={() => handlePlay(video.id)}
                          className="mt-3 w-full py-2.5 rounded-xl font-black text-white text-sm transition-all"
                          style={{ background: isPlaying ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg, #1d4ed8, #4338ca)' }}>
                          {isPlaying ? '✓ Now Playing' : '▶ Watch Video'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Delete confirmation */}
            {deleteId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Delete Video?</h3>
                  <p className="text-slate-500 font-medium mb-5">This video will be removed from the library.</p>
                  <div className="flex gap-3">
                    <button onClick={() => deleteVideo(deleteId)}
                      className="flex-1 py-3 rounded-xl font-black text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                      Yes, Delete
                    </button>
                    <button onClick={() => setDeleteId(null)}
                      className="flex-1 py-3 rounded-xl font-black text-slate-700 border-2 border-slate-200 text-sm hover:border-indigo-300 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
