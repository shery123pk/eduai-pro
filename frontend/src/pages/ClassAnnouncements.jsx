import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { path: '/teacher',               label: 'Dashboard',     icon: '🏠' },
  { path: '/teacher/students',      label: 'My Students',   icon: '👨‍🎓' },
  { path: '/teacher/assignments',   label: 'Assignments',   icon: '📋' },
  { path: '/teacher/announcements', label: 'Announcements', icon: '📢' },
  { path: '/student/videos',        label: 'Video Library', icon: '🎬' },
  { path: '/student/tools',         label: 'AI Tools',      icon: '🛠️' },
  { path: '/student/quiz',          label: 'AI Quiz',       icon: '📊' },
  { path: '/student/homework',      label: 'Homework',      icon: '📝' },
  { path: '/student/chat',          label: 'AI Chat',       icon: '💬' },
];

export const ANNOUNCEMENTS_KEY = 'teacher_announcements';

const priorityStyles = {
  info:      { border: 'border-indigo-200', bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: 'ℹ️', label: 'Info' },
  important: { border: 'border-amber-300',  bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700 border-amber-200',    icon: '⚠️', label: 'Important' },
  urgent:    { border: 'border-red-300',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700 border-red-200',           icon: '🚨', label: 'Urgent' },
};

const emptyForm = { title: '', message: '', priority: 'info' };

export default function ClassAnnouncements() {
  const [announcements, setAnnouncements] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const save = (updated) => {
    setAnnouncements(updated);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(updated));
  };

  const post = () => {
    if (!form.title.trim())   { toast.error('Title is required'); return; }
    if (!form.message.trim()) { toast.error('Message is required'); return; }
    const item = { id: Date.now(), ...form, createdAt: new Date().toISOString() };
    save([item, ...announcements]);
    setForm(emptyForm);
    setShowForm(false);
    toast.success('Announcement posted! Students will see it on their dashboard.');
  };

  const del = (id) => {
    save(announcements.filter(a => a.id !== id));
    setDeleteId(null);
    toast.success('Announcement removed');
  };

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-black text-slate-900">📢 Class Announcements</h1>
                <p className="text-slate-500 font-medium mt-1">Post messages visible to all students on their dashboard</p>
              </div>
              <button onClick={() => setShowForm(!showForm)}
                className="px-5 py-3 rounded-xl font-black text-white text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
                {showForm ? '✕ Cancel' : '+ New Announcement'}
              </button>
            </div>

            {/* Create Form */}
            {showForm && (
              <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-scale">
                <h2 className="text-xl font-black text-slate-900">New Announcement</h2>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Quiz Tomorrow — Chapter 3"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400 transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-1.5">Message *</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Write your announcement message here..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400 transition-all resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">Priority</label>
                  <div className="flex gap-3">
                    {Object.entries(priorityStyles).map(([key, val]) => (
                      <button key={key} onClick={() => setForm(f => ({ ...f, priority: key }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-black border-2 transition-all ${
                          form.priority === key
                            ? `${val.bg} ${val.border}`
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}>
                        {val.icon} {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={post}
                  className="px-8 py-3 rounded-xl font-black text-white text-base shadow-md"
                  style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                  📢 Post Announcement
                </button>
              </div>
            )}

            {/* Announcements list */}
            {announcements.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="text-4xl mb-3">📢</div>
                <p className="font-black text-slate-600 text-lg">No announcements yet</p>
                <p className="text-slate-400 mt-1 font-medium">Post an announcement and students will see it on their dashboard</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map(a => {
                  const st = priorityStyles[a.priority] || priorityStyles.info;
                  return (
                    <div key={a.id} className={`bg-white border-2 ${st.border} rounded-2xl overflow-hidden shadow-sm`}>
                      {/* Color stripe */}
                      <div className={`${st.bg} px-5 py-3 flex items-center justify-between gap-3`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl">{st.icon}</span>
                          <h3 className="font-black text-slate-900 text-base">{a.title}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${st.badge}`}>{st.label}</span>
                        </div>
                        <button onClick={() => setDeleteId(a.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors text-lg flex-shrink-0">
                          🗑
                        </button>
                      </div>
                      <div className="px-5 py-4">
                        <p className="text-slate-700 font-medium text-sm leading-relaxed">{a.message}</p>
                        <p className="text-xs text-slate-400 font-bold mt-3">
                          📅 Posted: {new Date(a.createdAt).toLocaleString('en-PK', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Announcement?</h3>
            <p className="text-slate-500 font-medium mb-5">Students will no longer see this announcement.</p>
            <div className="flex gap-3">
              <button onClick={() => del(deleteId)}
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
  );
}
