import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const sidebarLinks = [
  { path: '/student', label: 'Home', icon: '🏠' },
  { path: '/student/courses', label: 'Courses', icon: '📚' },
  { path: '/student/mastery-coach', label: 'Mastery Coach', icon: '🧠' },
  { path: '/student/tools', label: 'AI Tools', icon: '🛠️' },
  { path: '/student/practice', label: 'AI Practice', icon: '🤖' },
  { path: '/student/chat', label: 'AI Chat', icon: '💬' },
  { path: '/student/homework', label: 'Homework', icon: '📝' },
  { path: '/student/quiz', label: 'Quizzes', icon: '📊' },
  { path: '/student/gamification', label: 'Achievements', icon: '🏆' },
  { path: '/student/videos', label: 'Videos', icon: '🎬' },
];

const TOOLS = [
  { id: 'explainer',  icon: '💡', title: 'Concept Explainer',        desc: 'Get clear explanations with analogies for any concept',     color: '#2563eb', bg: '#1e3a8a' },
  { id: 'flashcards', icon: '🃏', title: 'Flashcard Generator',       desc: 'Create study flashcards from any topic instantly',           color: '#7c3aed', bg: '#312e81' },
  { id: 'worksheet',  icon: '📄', title: 'Worksheet Generator',       desc: 'Get practice worksheets at 3 difficulty levels',             color: '#059669', bg: '#064e3b' },
  { id: 'animate',    icon: '📺', title: 'Worksheet Animator',        desc: 'Upload worksheet + describe — get animated visual lesson',   color: '#ea580c', bg: '#7c2d12' },
  { id: 'lesson',     icon: '📋', title: 'Lesson Planner',            desc: 'AI-generated lesson plans for teachers (7 frameworks)',      color: '#d97706', bg: '#78350f' },
  { id: 'doubt',      icon: '❓', title: 'Doubt Solver',              desc: 'Step-by-step solution to any problem or question',           color: '#dc2626', bg: '#7f1d1d' },
  { id: 'summary',    icon: '📝', title: 'Topic Summarizer',          desc: 'Get a concise summary of any subject topic',                 color: '#0891b2', bg: '#164e63' },
];

const grades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'University'];
const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science', 'General'];
const frameworks = ['Standard Lesson Plan', '5E Model', 'Activity-Based', 'Project-Based', 'Inquiry-Based', 'Flipped Classroom', 'STEAM'];

function callAI(token, prompt, systemPrompt = 'You are an expert educator. Respond clearly and educationally.') {
  return axios.post(`${API_URL}/api/tutor/ask`, {
    question: prompt,
    subject: 'General',
    systemPrompt
  }, { headers: { Authorization: `Bearer ${token}` } });
}

// ---- CONCEPT EXPLAINER ----
function ConceptExplainer() {
  const [concept, setConcept] = useState('');
  const [grade, setGrade] = useState('Grade 9');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const explain = async () => {
    if (!concept.trim()) { toast.error('Enter a concept'); return; }
    setLoading(true); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const prompt = `Explain the concept "${concept}" for ${grade} students.

Provide:
1. **Simple Explanation**: In plain language (2-3 sentences)
2. **Analogy**: A relatable real-world analogy that makes it click
3. **Key Points**: 3-4 bullet points of what students must remember
4. **Example**: One concrete example showing the concept in action
5. **Common Mistake**: One misconception students often have

Format with clear headings using **bold** text.`;

      const res = await callAI(token, prompt);
      setResult(res.data.answer || res.data.response || res.data.message);
    } catch { toast.error('Failed. Check OpenAI API key.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-600 mb-1">Concept *</label>
          <input value={concept} onChange={e => setConcept(e.target.value)} onKeyPress={e => e.key === 'Enter' && explain()}
            placeholder="e.g. Photosynthesis, Pythagorean theorem, Supply and demand..."
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Grade Level</label>
          <select value={grade} onChange={e => setGrade(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-400 text-sm">
            {grades.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <button onClick={explain} disabled={loading || !concept.trim()}
        className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {loading ? 'Explaining...' : 'Explain Concept'}
      </button>
      {loading && <div className="text-center py-8"><div className="loader-modern mx-auto mb-3"></div><p className="text-slate-400 text-sm">Generating explanation...</p></div>}
      {result && (
        <div className="glass-card rounded-xl p-6 border border-slate-700 animate-slide-in">
          <div className="text-sm font-semibold text-blue-400 mb-3">{concept} — {grade}</div>
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {result.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- FLASHCARD GENERATOR ----
function FlashcardGenerator() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [count, setCount] = useState(8);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState('grid'); // grid | study

  const generate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    setLoading(true); setCards([]); setFlipped({});
    try {
      const token = localStorage.getItem('token');
      const prompt = `Generate ${count} flashcards about "${topic}" for ${subject}.

Return ONLY valid JSON:
{
  "flashcards": [
    { "id": 1, "term": "Term or question", "definition": "Clear definition or answer (1-2 sentences)" }
  ]
}

Rules: Terms should be key vocabulary, concepts, or questions. Definitions should be accurate and concise.`;

      const res = await callAI(token, prompt, 'You are an expert educator. Always return valid JSON only.');
      const text = res.data.answer || res.data.response || res.data.message || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        setCards(data.flashcards || []);
        setCurrent(0);
        toast.success(`${data.flashcards?.length || 0} flashcards generated!`);
      } else { toast.error('Could not parse flashcards.'); }
    } catch { toast.error('Failed. Check OpenAI API key.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-600 mb-1">Topic *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Cell Biology, Algebra basics..."
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none text-sm">
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Count</label>
          <select value={count} onChange={e => setCount(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none text-sm">
            {[5, 8, 10, 15, 20].map(n => <option key={n} value={n}>{n} cards</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={generate} disabled={loading || !topic.trim()}
          className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm bg-purple-700 hover:bg-purple-600 disabled:opacity-50 transition-colors">
          {loading ? 'Generating...' : 'Generate Flashcards'}
        </button>
        {cards.length > 0 && (
          <button onClick={() => setMode(mode === 'grid' ? 'study' : 'grid')}
            className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 text-sm bg-slate-100 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors">
            {mode === 'grid' ? 'Study Mode' : 'Grid View'}
          </button>
        )}
      </div>

      {loading && <div className="text-center py-8"><div className="loader-modern mx-auto mb-3"></div><p className="text-slate-400 text-sm">Creating flashcards...</p></div>}

      {/* Study Mode */}
      {!loading && cards.length > 0 && mode === 'study' && (
        <div className="space-y-4 animate-fade-scale">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Card {current + 1} of {cards.length}</span>
            <span>{Math.round(((current + 1) / cards.length) * 100)}% done</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${((current + 1) / cards.length) * 100}%` }} />
          </div>

          <button onClick={() => setFlipped(f => ({ ...f, [current]: !f[current] }))}
            className="w-full glass-card rounded-xl border border-slate-700 p-8 text-center min-h-52 flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 transition-all group">
            {!flipped[current] ? (
              <>
                <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Term — click to flip</div>
                <div className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{cards[current]?.term}</div>
              </>
            ) : (
              <>
                <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Definition — click to flip back</div>
                <div className="text-lg text-slate-200 leading-relaxed">{cards[current]?.definition}</div>
              </>
            )}
          </button>

          <div className="flex gap-3">
            <button onClick={() => { setCurrent(c => Math.max(0, c - 1)); setFlipped(f => ({ ...f, [current]: false })); }}
              disabled={current === 0}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-slate-100 text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40 transition-colors">
              ← Previous
            </button>
            <button onClick={() => { setCurrent(c => Math.min(cards.length - 1, c + 1)); setFlipped(f => ({ ...f, [current]: false })); }}
              disabled={current === cards.length - 1}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-purple-700 text-white hover:bg-purple-600 disabled:opacity-40 transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Grid Mode */}
      {!loading && cards.length > 0 && mode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-scale">
          {cards.map((card, idx) => (
            <button key={card.id || idx} onClick={() => setFlipped(f => ({ ...f, [idx]: !f[idx] }))}
              className="glass-card rounded-xl border border-slate-700 p-4 text-left hover:border-purple-600 transition-all min-h-24 group">
              {!flipped[idx] ? (
                <>
                  <div className="text-xs text-slate-500 mb-1">Term</div>
                  <div className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">{card.term}</div>
                  <div className="text-xs text-slate-600 mt-2">Click to see definition</div>
                </>
              ) : (
                <>
                  <div className="text-xs text-purple-400 mb-1">Definition</div>
                  <div className="text-slate-700 text-sm leading-relaxed">{card.definition}</div>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- WORKSHEET GENERATOR ----
function WorksheetGenerator() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    setLoading(true); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const prompt = `Create a practice worksheet about "${topic}" in ${subject} with THREE difficulty tiers.

Format:
## EASY (Basic)
5 simple questions (fill-in-blank or short answer)

## MEDIUM (Intermediate)
4 application questions

## HARD (Advanced)
3 challenging/analytical questions

Include an Answer Key at the end for all questions.
Keep questions educational and accurate.`;

      const res = await callAI(token, prompt);
      setResult(res.data.answer || res.data.response || res.data.message);
    } catch { toast.error('Failed. Check OpenAI API key.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-600 mb-1">Topic *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Fractions, Newton's Laws, Photosynthesis..."
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none text-sm">
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <button onClick={generate} disabled={loading || !topic.trim()}
        className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 transition-colors">
        {loading ? 'Generating...' : 'Generate Worksheet (3 Levels)'}
      </button>
      {loading && <div className="text-center py-8"><div className="loader-modern mx-auto mb-3"></div><p className="text-slate-400 text-sm">Creating Easy / Medium / Hard worksheet...</p></div>}
      {result && (
        <div className="glass-card rounded-xl p-6 border border-slate-700 animate-slide-in">
          <div className="flex justify-end mb-3">
            <button onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}
              className="text-xs text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors">
              Copy
            </button>
          </div>
          <div className="text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
}

// ---- LESSON PLANNER ----
function LessonPlanner() {
  const [form, setForm] = useState({ topic: '', subject: 'Mathematics', grade: 'Grade 9', duration: '45', framework: 'Standard Lesson Plan', objectives: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!form.topic.trim()) { toast.error('Enter a topic'); return; }
    setLoading(true); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const prompt = `Create a detailed ${form.framework} for teaching "${form.topic}" in ${form.subject}, ${form.grade}, ${form.duration} minutes.
${form.objectives ? `Learning objectives: ${form.objectives}` : ''}

Include:
1. **Learning Objectives** (3-4 measurable outcomes)
2. **Materials Needed**
3. **Introduction/Hook** (5 min) - engage students
4. **Main Instruction** - step-by-step teaching with activities
5. **Guided Practice** - teacher-led exercises
6. **Independent Practice** - student work
7. **Assessment** - how to check understanding
8. **Closure** - summarize and connect
9. **Differentiation** - for struggling and advanced students
10. **Homework** (optional)

Framework style: ${form.framework}`;

      const res = await callAI(token, prompt);
      setResult(res.data.answer || res.data.response || res.data.message);
    } catch { toast.error('Failed. Check OpenAI API key.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Topic *</label>
          <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Introduction to Fractions"
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Framework</label>
          <select value={form.framework} onChange={e => setForm(f => ({ ...f, framework: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none text-sm">
            {frameworks.map(fw => <option key={fw}>{fw}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
          <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none text-sm">
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Grade</label>
            <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none text-sm">
              {grades.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Duration (min)</label>
            <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none text-sm">
              {['30', '45', '60', '90'].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-600 mb-1">Specific Objectives (optional)</label>
          <input value={form.objectives} onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))} placeholder="e.g. Students will be able to add fractions with unlike denominators"
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm" />
        </div>
      </div>
      <button onClick={generate} disabled={loading || !form.topic.trim()}
        className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm bg-amber-700 hover:bg-amber-600 disabled:opacity-50 transition-colors">
        {loading ? 'Generating...' : 'Generate Lesson Plan'}
      </button>
      {loading && <div className="text-center py-8"><div className="loader-modern mx-auto mb-3"></div><p className="text-slate-400 text-sm">Creating your lesson plan...</p></div>}
      {result && (
        <div className="glass-card rounded-xl p-6 border border-slate-700 animate-slide-in">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-amber-400">{form.framework} — {form.topic}</div>
            <button onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}
              className="text-xs text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors">
              Copy
            </button>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {result.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- DOUBT SOLVER ----
function DoubtSolver() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const solve = async () => {
    if (!question.trim()) { toast.error('Enter your doubt'); return; }
    setLoading(true); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const prompt = `A student has this doubt or question: "${question}"

Provide a clear step-by-step answer:
1. **Direct Answer**: State the answer clearly
2. **Step-by-Step Explanation**: Break it down into numbered steps
3. **Why It Works**: Explain the underlying concept
4. **Practice Problem**: Give one similar problem for the student to try
5. **Answer**: Solution to the practice problem

Be clear, educational, and encourage the student.`;

      const res = await callAI(token, prompt);
      setResult(res.data.answer || res.data.response || res.data.message);
    } catch { toast.error('Failed. Check OpenAI API key.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Your Question or Doubt *</label>
        <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
          placeholder="e.g. How do I solve quadratic equations? Why does the sky appear blue? What causes inflation?"
          className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm resize-none" />
      </div>
      <button onClick={solve} disabled={loading || !question.trim()}
        className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm bg-red-700 hover:bg-red-600 disabled:opacity-50 transition-colors">
        {loading ? 'Solving...' : 'Solve My Doubt'}
      </button>
      {loading && <div className="text-center py-8"><div className="loader-modern mx-auto mb-3"></div><p className="text-slate-400 text-sm">Working through your doubt step-by-step...</p></div>}
      {result && (
        <div className="glass-card rounded-xl p-6 border border-slate-700 animate-slide-in">
          <div className="text-sm text-slate-300 leading-relaxed">
            {result.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- TOPIC SUMMARIZER ----
function TopicSummarizer() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const summarize = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    setLoading(true); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const prompt = `Provide a comprehensive study summary of "${topic}" in ${subject}.

Include:
**Overview**: 2-3 sentence overview
**Key Concepts**: Bullet list of main concepts (5-8 points)
**Important Formulas/Definitions**: Any formulas or key terms
**How It Connects**: How this topic links to other concepts
**Exam Tips**: 2-3 things students commonly get wrong
**Quick Review Questions**: 3 questions to test understanding`;

      const res = await callAI(token, prompt);
      setResult(res.data.answer || res.data.response || res.data.message);
    } catch { toast.error('Failed. Check OpenAI API key.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-600 mb-1">Topic *</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyPress={e => e.key === 'Enter' && summarize()}
            placeholder="e.g. Mitosis, The French Revolution, Ohm's Law..."
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none text-sm">
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <button onClick={summarize} disabled={loading || !topic.trim()}
        className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 transition-colors">
        {loading ? 'Summarizing...' : 'Generate Summary'}
      </button>
      {loading && <div className="text-center py-8"><div className="loader-modern mx-auto mb-3"></div><p className="text-slate-400 text-sm">Creating your study summary...</p></div>}
      {result && (
        <div className="glass-card rounded-xl p-6 border border-slate-700 animate-slide-in">
          <div className="flex justify-end mb-3">
            <button onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}
              className="text-xs text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors">
              Copy
            </button>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed">
            {result.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- WORKSHEET ANIMATOR ----
function WorksheetAnimator() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [description, setDescription] = useState('');
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };

  const animate = async () => {
    if (!description.trim()) { toast.error('Please describe what you want to learn'); return; }
    setLoading(true); setSlides([]);
    try {
      const token = localStorage.getItem('token');
      const topicHint = imageFile ? `The worksheet image shows a topic the student uploaded.` : '';
      const prompt = `A student wants to learn about: "${description}". ${topicHint}

Create an animated visual lesson with exactly 6 slides. Return ONLY valid JSON:
{
  "title": "Lesson title here",
  "slides": [
    {
      "id": 1,
      "heading": "Bold heading for this slide",
      "content": "2-3 sentences explaining this part clearly. Use simple language.",
      "emoji": "🌱",
      "color": "#4f46e5",
      "bg": "#ede9fe",
      "fact": "One interesting fun fact about this"
    }
  ]
}

Make the slides flow as: Introduction → Part 1 → Part 2 → Part 3 → How it works → Summary.
Use appropriate emojis. Colors should be hex codes. Make it educational and engaging.`;

      const res = await callAI(token, prompt, 'You are an expert educator. Always return valid JSON only. Create engaging animated lesson slides.');
      const text = res.data.answer || res.data.response || res.data.message || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        if (data.slides?.length > 0) {
          setSlides(data.slides);
          setCurrent(0);
          setPlaying(true);
          toast.success('Animation ready! Click through the slides.');
        } else toast.error('Could not generate animation. Try a more specific description.');
      } else toast.error('Failed to parse. Try again.');
    } catch { toast.error('Failed. Check OpenAI API key.'); }
    finally { setLoading(false); }
  };

  const slide = slides[current];

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
        <p className="text-sm font-bold text-orange-700">📺 Learn Worksheet Through Animation</p>
        <p className="text-xs text-orange-600 mt-1">Upload your worksheet photo + describe what you want to learn → Get animated visual lesson</p>
      </div>

      {!playing && (
        <div className="space-y-4">
          {/* Photo upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Upload Worksheet Photo (Optional)</label>
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-orange-400 bg-orange-50' : 'border-slate-300 hover:border-orange-300 bg-slate-50'}`}>
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img src={imagePreview} alt="Worksheet" className="max-h-40 rounded-lg shadow mb-2 object-contain" />
                  <button onClick={() => { setImageFile(null); setImagePreview(''); }} className="text-xs text-red-500 font-bold">✕ Remove</button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <span className="text-4xl mb-2">📄</span>
                  <span className="font-bold text-slate-600 text-sm">Drop worksheet here or click to upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                </label>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">What do you want to learn? *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="e.g. I want to learn about plant parts — leaves, stem, roots, and flowers. Explain how each part works and what it does..."
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-orange-400 resize-none text-sm" />
          </div>

          <button onClick={animate} disabled={loading || !description.trim()}
            className="w-full py-4 rounded-xl font-black text-white text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)', boxShadow: '0 6px 20px rgba(234,88,12,0.35)' }}>
            {loading ? <><div className="loader-modern" style={{width:20,height:20,borderWidth:2}}></div><span>Creating Animation...</span></> : <><span>✨</span><span>Animate</span></>}
          </button>
        </div>
      )}

      {/* Animation player */}
      {playing && slides.length > 0 && slide && (
        <div className="space-y-4 animate-fade-scale">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm font-bold text-slate-500">
            <span>Slide {current + 1} of {slides.length}</span>
            <button onClick={() => { setPlaying(false); setSlides([]); setCurrent(0); }}
              className="text-red-500 hover:text-red-700 font-bold">✕ Close</button>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${((current+1)/slides.length)*100}%`, background: slide.color }} />
          </div>

          {/* Slide card */}
          <div className="rounded-2xl p-7 border-2 text-center min-h-64 flex flex-col items-center justify-center gap-4 transition-all duration-500 animate-fade-scale"
            style={{ backgroundColor: slide.bg, borderColor: slide.color + '55' }}>
            <div className="text-6xl animate-float">{slide.emoji}</div>
            <h3 className="text-2xl font-black" style={{ color: slide.color }}>{slide.heading}</h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed max-w-md">{slide.content}</p>
            {slide.fact && (
              <div className="mt-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: slide.color }}>
                💡 Fun fact: {slide.fact}
              </div>
            )}
          </div>

          {/* Worksheet image shown alongside */}
          {imagePreview && (
            <div className="flex gap-3">
              <img src={imagePreview} alt="Your worksheet" className="w-32 h-24 object-cover rounded-xl border-2 border-slate-200 flex-shrink-0" />
              <p className="text-xs text-slate-500 font-medium self-center">Your worksheet — the animation explains this content slide by slide</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <button onClick={() => setCurrent(c => Math.max(0,c-1))} disabled={current===0}
              className="flex-1 py-3 rounded-xl font-black text-sm bg-white border-2 border-slate-200 text-slate-600 hover:border-orange-300 disabled:opacity-40 transition-all">
              ← Previous
            </button>
            {current < slides.length-1 ? (
              <button onClick={() => setCurrent(c => c+1)}
                className="flex-1 py-3 rounded-xl font-black text-white text-sm"
                style={{ background: `linear-gradient(135deg, ${slide.color}, #8b5cf6)` }}>
                Next →
              </button>
            ) : (
              <button onClick={() => setCurrent(0)}
                className="flex-1 py-3 rounded-xl font-black text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                🔄 Restart
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TOOL_COMPONENTS = {
  explainer:  ConceptExplainer,
  flashcards: FlashcardGenerator,
  worksheet:  WorksheetGenerator,
  animate:    WorksheetAnimator,
  lesson:     LessonPlanner,
  doubt:      DoubtSolver,
  summary:    TopicSummarizer,
};

export default function ToolsHub() {
  const [activeTool, setActiveTool] = useState(null);
  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool.id] : null;

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="animate-slide-in">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-xl">🛠️</div>
                <h1 className="text-3xl font-bold text-slate-800">AI Tools Hub</h1>
              </div>
              <p className="text-slate-400 ml-13">Structured AI tools for learning — no prompt engineering needed</p>
            </div>

            {/* Tool Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TOOLS.map(tool => (
                <button key={tool.id} onClick={() => setActiveTool(tool)}
                  className={`glass-card rounded-xl p-5 border text-left transition-all hover:border-slate-500 group ${
                    activeTool?.id === tool.id ? 'border-blue-600' : 'border-slate-700'
                  }`}>
                  <div className="text-3xl mb-3">{tool.icon}</div>
                  <div className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">{tool.title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{tool.desc}</div>
                </button>
              ))}
            </div>

            {/* Active Tool Panel */}
            {activeTool && ActiveComponent && (
              <div className="glass-card rounded-xl border border-slate-700 overflow-hidden animate-fade-scale">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700" style={{ backgroundColor: activeTool.bg }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activeTool.icon}</span>
                    <div>
                      <div className="font-semibold text-white">{activeTool.title}</div>
                      <div className="text-xs text-slate-400">{activeTool.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTool(null)} className="text-slate-400 hover:text-white text-xl transition-colors">×</button>
                </div>
                <div className="p-6">
                  <ActiveComponent />
                </div>
              </div>
            )}

            {!activeTool && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Select a tool above to get started
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
