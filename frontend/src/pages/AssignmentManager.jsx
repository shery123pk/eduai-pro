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

const STORAGE_KEY = 'teacher_assignments';

const subjectColors = {
  Mathematics: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Physics:     'bg-purple-100 text-purple-700 border-purple-200',
  Chemistry:   'bg-green-100 text-green-700 border-green-200',
  Biology:     'bg-orange-100 text-orange-700 border-orange-200',
  English:     'bg-pink-100 text-pink-700 border-pink-200',
  General:     'bg-slate-100 text-slate-700 border-slate-200',
};

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'General'];

function getStatus(assignment) {
  if (assignment.closed) return 'closed';
  const due = new Date(assignment.dueDate);
  const now = new Date();
  if (due < now) return 'overdue';
  return 'active';
}

const statusStyles = {
  active:  { bg: 'bg-green-100 text-green-700 border-green-200',  label: '✅ Active'  },
  overdue: { bg: 'bg-red-100 text-red-700 border-red-200',        label: '⚠️ Overdue' },
  closed:  { bg: 'bg-slate-100 text-slate-500 border-slate-200',  label: '🔒 Closed'  },
};

const emptyForm = { title: '', subject: 'Mathematics', description: '', dueDate: '' };

export default function AssignmentManager() {
  const [assignments, setAssignments] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('all');

  const save = (updated) => {
    setAssignments(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addAssignment = () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.dueDate)      { toast.error('Due date is required'); return; }
    const newItem = {
      id: Date.now(),
      ...form,
      closed: false,
      createdAt: new Date().toISOString(),
    };
    save([newItem, ...assignments]);
    setForm(emptyForm);
    setShowForm(false);
    toast.success('Assignment created!');
  };

  const toggleClose = (id) => {
    save(assignments.map(a => a.id === id ? { ...a, closed: !a.closed } : a));
  };

  const deleteAssignment = (id) => {
    save(assignments.filter(a => a.id !== id));
    setDeleteId(null);
    toast.success('Assignment deleted');
  };

  const filtered = filter === 'all' ? assignments : assignments.filter(a => getStatus(a) === filter);

  const counts = {
    all:     assignments.length,
    active:  assignments.filter(a => getStatus(a) === 'active').length,
    overdue: assignments.filter(a => getStatus(a) === 'overdue').length,
    closed:  assignments.filter(a => getStatus(a) === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-black text-slate-900">📋 Assignments</h1>
                <p className="text-slate-500 font-medium mt-1">Create and manage assignments for your students</p>
              </div>
              <button onClick={() => setShowForm(!showForm)}
                className="px-5 py-3 rounded-xl font-black text-white text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
                {showForm ? '✕ Cancel' : '+ New Assignment'}
              </button>
            </div>

            {/* Create Form */}
            {showForm && (
              <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-scale">
                <h2 className="text-xl font-black text-slate-900">Create New Assignment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Assignment Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Chapter 5 Practice Problems"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400">
                      {subjects.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Due Date *</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-black text-slate-700 mb-1.5">Description / Instructions</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe what students need to do..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400 transition-all resize-none" />
                  </div>
                </div>
                <button onClick={addAssignment}
                  className="px-8 py-3 rounded-xl font-black text-white text-base shadow-md"
                  style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                  ✅ Create Assignment
                </button>
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all',     label: `All (${counts.all})` },
                { key: 'active',  label: `Active (${counts.active})` },
                { key: 'overdue', label: `Overdue (${counts.overdue})` },
                { key: 'closed',  label: `Closed (${counts.closed})` },
              ].map(tab => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                    filter === tab.key
                      ? 'text-white shadow-md'
                      : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                  style={filter === tab.key ? { background: 'linear-gradient(135deg, #6366f1, #4338ca)' } : {}}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Assignment list */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="text-4xl mb-3">📋</div>
                <p className="font-black text-slate-600 text-lg">
                  {assignments.length === 0 ? 'No assignments yet' : 'No assignments in this filter'}
                </p>
                <p className="text-slate-400 mt-1 font-medium">
                  {assignments.length === 0 && 'Click "+ New Assignment" to create your first one'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(a => {
                  const st = getStatus(a);
                  const style = statusStyles[st];
                  return (
                    <div key={a.id} className={`bg-white border-2 rounded-2xl p-5 shadow-sm transition-all ${
                      st === 'overdue' ? 'border-red-200' : st === 'closed' ? 'border-slate-200 opacity-70' : 'border-slate-200 hover:border-indigo-200'
                    }`}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className={`font-black text-slate-900 text-base ${st === 'closed' ? 'line-through text-slate-500' : ''}`}>
                              {a.title}
                            </h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${style.bg}`}>{style.label}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${subjectColors[a.subject] || subjectColors.General}`}>{a.subject}</span>
                          </div>
                          {a.description && (
                            <p className="text-sm text-slate-600 font-medium mt-1">{a.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs font-bold text-slate-400">
                            <span>📅 Due: <span className={st === 'overdue' ? 'text-red-600' : 'text-slate-600'}>{new Date(a.dueDate).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' })}</span></span>
                            <span>🕒 Created: {new Date(a.createdAt).toLocaleDateString('en-PK', { day:'numeric', month:'short' })}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => toggleClose(a.id)}
                            className="px-3 py-2 rounded-xl text-xs font-black border-2 border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-all">
                            {a.closed ? '🔓 Reopen' : '🔒 Close'}
                          </button>
                          <button onClick={() => setDeleteId(a.id)}
                            className="px-3 py-2 rounded-xl text-xs font-black border-2 border-red-100 text-red-500 hover:border-red-300 hover:bg-red-50 transition-all">
                            🗑
                          </button>
                        </div>
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
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Assignment?</h3>
            <p className="text-slate-500 font-medium mb-5">This will permanently remove the assignment.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteAssignment(deleteId)}
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
