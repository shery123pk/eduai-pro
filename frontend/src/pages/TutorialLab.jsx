import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'tutorialLab_customVideos';

const sidebarLinks = [
  { path: '/student',               label: 'Home',         icon: '🏠' },
  { path: '/student/courses',       label: 'Courses',      icon: '📚' },
  { path: '/student/tutorial-lab',  label: 'Tutorial Lab', icon: '🖥️' },
  { path: '/student/mastery-coach', label: 'Mastery Coach',icon: '🧠' },
  { path: '/student/tools',         label: 'AI Tools',     icon: '🛠️' },
  { path: '/student/practice',      label: 'AI Practice',  icon: '🤖' },
  { path: '/student/chat',          label: 'AI Chat',      icon: '💬' },
  { path: '/student/homework',      label: 'Homework',     icon: '📝' },
  { path: '/student/quiz',          label: 'Quizzes',      icon: '📊' },
  { path: '/student/gamification',  label: 'Achievements', icon: '🏆' },
  { path: '/student/videos',        label: 'Videos',       icon: '🎬' },
];

// ── Real MS Word tutorial videos (step-by-step, kid-friendly) ─────────────────
const DEFAULT_LEVELS = {
  'Class 1–2': {
    color: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700',
    lessons: [
      {
        id: 'l1', step: 1,
        title: 'What is Microsoft Word?',
        channel: 'GCFLearnFree', duration: '4 min',
        desc: 'Discover what MS Word is, why we use it, and where to find it on your computer.',
      },
      {
        id: 'l2', step: 2,
        title: 'Opening Word & the Screen',
        channel: 'Kevin Stratvert', duration: '5 min',
        desc: 'Open Microsoft Word and learn the names of the Ribbon, toolbar, and document area.',
      },
      {
        id: 'l3', step: 3,
        title: 'Typing & Editing Text',
        channel: 'GCFLearnFree', duration: '5 min',
        desc: 'Use the keyboard to type letters, numbers, spaces, and your own name.',
      },
      {
        id: 'l4', step: 4,
        title: 'Saving Your Document',
        channel: 'GCFLearnFree', duration: '4 min',
        desc: 'Save your work with Ctrl+S so you never lose what you have written.',
      },
    ],
    tasks: [
      '✏️ Type your full name on the first line.',
      '✏️ Press Enter and type the name of your school.',
      '✏️ Press Enter again and type today\'s date.',
      '✏️ Press Ctrl+S to save your document.',
    ],
  },
  'Class 3–4': {
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700',
    lessons: [
      {
        id: 'l5', step: 1,
        title: 'Bold, Italic & Underline',
        channel: 'GCFLearnFree', duration: '6 min',
        desc: 'Select text and apply bold (Ctrl+B), italic (Ctrl+I), and underline (Ctrl+U).',
      },
      {
        id: 'l6', step: 2,
        title: 'Changing Font & Text Size',
        channel: "Teacher's Tech", duration: '7 min',
        desc: 'Pick a font style and change how big or small your letters appear on screen.',
      },
      {
        id: 'l7', step: 3,
        title: 'Text Colour & Highlighting',
        channel: 'Kevin Stratvert', duration: '6 min',
        desc: 'Make your text colourful and highlight important words like a real marker.',
      },
      {
        id: 'l8', step: 4,
        title: 'Copy, Cut & Paste',
        channel: 'GCFLearnFree', duration: '5 min',
        desc: 'Move and duplicate text using Ctrl+C (copy), Ctrl+X (cut), Ctrl+V (paste).',
      },
    ],
    tasks: [
      '✏️ Write a short paragraph about your favourite animal.',
      '✏️ Make the animal\'s name Bold and Underlined.',
      '✏️ Change the paragraph font to Georgia, size 14.',
      '✏️ Colour your heading text blue using the colour button.',
    ],
  },
  'Class 5': {
    color: 'from-purple-400 to-violet-500',
    bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700',
    lessons: [
      {
        id: 'l9', step: 1,
        title: 'Bullet Points & Numbered Lists',
        channel: 'GCFLearnFree', duration: '6 min',
        desc: 'Organise your ideas clearly using bullet points or numbered steps.',
      },
      {
        id: 'l10', step: 2,
        title: 'Text Alignment',
        channel: 'GCFLearnFree', duration: '7 min',
        desc: 'Align your text to the left, centre, right, or justify it like a book.',
      },
      {
        id: 'l11', step: 3,
        title: 'Inserting a Table',
        channel: 'Kevin Stratvert', duration: '8 min',
        desc: 'Insert a table into your document to organise information in rows and columns.',
      },
      {
        id: 'l12', step: 4,
        title: 'Writing a Complete Report',
        channel: 'GCFLearnFree', duration: '10 min',
        desc: 'Combine all your skills to write a properly formatted one-page report.',
      },
    ],
    tasks: [
      '✏️ Write a title, centre-align it, make it Bold, and set the size to 20.',
      '✏️ Create a numbered list of 5 things you learned this week.',
      '✏️ Add a bullet list of your 3 favourite subjects.',
      '✏️ Write one paragraph and justify-align it.',
    ],
  },
};

// ── Word Editor (TipTap powered) ──────────────────────────────────────────────
const FONTS = ['Arial','Times New Roman','Calibri','Courier New','Georgia','Verdana','Comic Sans MS','Trebuchet MS'];
const SIZES = [8,9,10,11,12,14,16,18,20,24,28,32,36,40,48];

function ToolBtn({ title, onClick, active, children, cls = '' }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`px-2 py-1 rounded text-sm font-bold transition-all select-none
        ${active ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'} ${cls}`}>
      {children}
    </button>
  );
}

const SEP = () => <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />;

const PRESET_COLORS = [
  '#000000','#434343','#666666','#b7b7b7','#ffffff','#ff0000',
  '#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff',
  '#9900ff','#ff00ff','#e06666','#f6b26b','#ffd966','#93c47d',
  '#76a5af','#6fa8dc','#8e7cc3','#c27ba0','#990000','#006600',
];

function ColorPicker({ editor }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState('#000000');
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const applyColor = (color) => {
    setPicked(color);
    setOpen(false);
    /* Editor never lost focus (onMouseDown+preventDefault everywhere in this picker),
       so the selection is still intact — just apply directly. */
    editor.chain().focus().setColor(color).run();
  };

  return (
    <div ref={wrapRef} className="relative flex-shrink-0">
      <button
        onMouseDown={e => { e.preventDefault(); setOpen(p => !p); }}
        title="Text Color"
        className="px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-0.5 select-none">
        <span className="text-sm font-black text-slate-800 leading-none"
          style={{ borderBottom: `3px solid ${picked}` }}>A</span>
        <span className="text-slate-500 text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute top-9 left-0 z-50 bg-white border border-slate-200 shadow-2xl rounded-xl p-2.5"
          style={{ width: 142 }}>
          <p className="text-xs font-bold text-slate-500 mb-1.5">Text Color</p>
          <div className="grid grid-cols-6 gap-1 mb-2">
            {PRESET_COLORS.map(c => (
              <button key={c} title={c}
                onMouseDown={e => { e.preventDefault(); applyColor(c); }}
                style={{ background: c }}
                className="w-5 h-5 rounded border border-slate-300 hover:scale-125 transition-transform cursor-pointer" />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Custom:</span>
            <input type="color" value={picked}
              onChange={e => setPicked(e.target.value)}
              className="w-8 h-6 cursor-pointer rounded border border-slate-200 p-0" />
            <button
              onMouseDown={e => { e.preventDefault(); applyColor(picked); }}
              className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded font-bold hover:bg-indigo-700">
              ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WordEditor() {
  const [activeTab, setActiveTab] = useState('Home');
  const [fontSize, setFontSize]   = useState(12);
  const [fontFam,  setFontFam]    = useState('Arial');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const selRef = useRef(null);   // saved {from,to} before toolbar steals focus

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyleKit,   /* includes TextStyle mark + Color + FontFamily + FontSize */
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    onUpdate({ editor }) {
      const text = editor.getText();
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
    onBlur({ editor }) {
      /* Preserve selection the moment editor loses focus to a toolbar control */
      const { from, to } = editor.state.selection;
      selRef.current = { from, to };
    },
    editorProps: {
      attributes: { class: 'focus:outline-none', spellcheck: 'true' },
    },
  });

  /* Save selection on mousedown of any control that will steal focus */
  const saveSel = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      selRef.current = { from, to };
    }
  };

  /* Restore saved selection then run a chain command */
  const withSel = (chainFn) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (selRef.current) chain.setTextSelection(selRef.current);
    chainFn(chain).run();
  };

  const applyFont = (f) => { setFontFam(f); withSel(c => c.setFontFamily(f)); };
  const applySize = (s) => { setFontSize(s); withSel(c => c.setFontSize(s + 'px')); };

  const downloadDoc = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>body{font-family:Arial,sans-serif;margin:2.5cm;font-size:12pt;line-height:1.7;}</style>
      </head><body>${editor?.getHTML() || ''}</body></html>`;
    Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([html], { type: 'text/html' })),
      download: 'my-document.doc'
    }).click();
  };

  if (!editor) return null;

  const T = ['Home', 'Insert', 'Format'];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-slate-100">

      {/* ── Ribbon ── */}
      <div className="bg-white border-b-2 border-slate-200 flex-shrink-0">

        {/* Tab bar */}
        <div className="flex px-2 bg-indigo-700">
          {T.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-white text-indigo-700 rounded-t-lg'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-600'}`}>
              {tab}
            </button>
          ))}
          <div className="ml-auto px-3 py-1.5 flex items-center gap-2">
            <button onClick={downloadDoc}
              className="px-3 py-1 rounded text-xs font-black text-white bg-green-500 hover:bg-green-600">
              💾 Save .doc
            </button>
            <button onClick={() => { editor.commands.clearContent(); selRef.current = null; }}
              className="px-3 py-1 rounded text-xs font-black text-white bg-red-500 hover:bg-red-600">
              🗑 Clear
            </button>
          </div>
        </div>

        {/* HOME tab */}
        {activeTab === 'Home' && (
          <div className="px-2 py-1.5 flex flex-wrap gap-0.5 items-center">
            <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↩</ToolBtn>
            <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↪</ToolBtn>
            <SEP />

            {/* Font family — save selection before dropdown opens */}
            <select value={fontFam}
              onMouseDown={saveSel}
              onChange={e => applyFont(e.target.value)}
              className="text-xs border border-slate-200 rounded px-1 py-0.5 h-7 bg-white text-slate-700 cursor-pointer"
              style={{ maxWidth: 130 }}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            {/* Font size — save selection before dropdown opens */}
            <select value={fontSize}
              onMouseDown={saveSel}
              onChange={e => applySize(Number(e.target.value))}
              className="text-xs border border-slate-200 rounded px-1 py-0.5 h-7 w-14 bg-white text-slate-700 cursor-pointer ml-1">
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <SEP />

            {/* Bold / Italic / Underline / Strike — onMouseDown keeps editor focus */}
            <ToolBtn title="Bold (Ctrl+B)"      onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive('bold')}><b>B</b></ToolBtn>
            <ToolBtn title="Italic (Ctrl+I)"    onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive('italic')}><i>I</i></ToolBtn>
            <ToolBtn title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><u>U</u></ToolBtn>
            <ToolBtn title="Strikethrough"      onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive('strike')}><s>S</s></ToolBtn>
            <SEP />

            {/* Color palette — never steals editor focus */}
            <ColorPicker editor={editor} />
            <SEP />

            {/* Headings — explicit set/unset avoids toggleHeading v3 quirks */}
            <ToolBtn title="Normal paragraph"
              onClick={() => editor.chain().focus().setParagraph().run()}
              active={editor.isActive('paragraph')} cls="text-xs">Normal</ToolBtn>
            <ToolBtn title="Heading 1"
              onClick={() => editor.isActive('heading',{level:1})
                ? editor.chain().focus().setParagraph().run()
                : editor.chain().focus().setHeading({level:1}).run()}
              active={editor.isActive('heading',{level:1})} cls="text-xs font-black">H1</ToolBtn>
            <ToolBtn title="Heading 2"
              onClick={() => editor.isActive('heading',{level:2})
                ? editor.chain().focus().setParagraph().run()
                : editor.chain().focus().setHeading({level:2}).run()}
              active={editor.isActive('heading',{level:2})} cls="text-xs font-black">H2</ToolBtn>
            <ToolBtn title="Heading 3"
              onClick={() => editor.isActive('heading',{level:3})
                ? editor.chain().focus().setParagraph().run()
                : editor.chain().focus().setHeading({level:3}).run()}
              active={editor.isActive('heading',{level:3})} cls="text-xs font-black">H3</ToolBtn>
          </div>
        )}

        {/* INSERT tab */}
        {activeTab === 'Insert' && (
          <div className="px-2 py-1.5 flex flex-wrap gap-0.5 items-center">
            <span className="text-xs text-slate-400 font-bold mr-1">Lists:</span>
            <ToolBtn title="Bullet List"   onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}>● List</ToolBtn>
            <ToolBtn title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>① List</ToolBtn>
            <SEP />
            <span className="text-xs text-slate-400 font-bold mr-1">Insert:</span>
            <ToolBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>— Line</ToolBtn>
            <ToolBtn title="Line break"      onClick={() => editor.chain().focus().insertContent('<p></p>').run()}>↵ Break</ToolBtn>
            <SEP />
            <ToolBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>" Quote</ToolBtn>
            <ToolBtn title="Code"       onClick={() => editor.chain().focus().toggleCode().run()}       active={editor.isActive('code')} cls="font-mono">{`</>`} Code</ToolBtn>
          </div>
        )}

        {/* FORMAT tab */}
        {activeTab === 'Format' && (
          <div className="px-2 py-1.5 flex flex-wrap gap-0.5 items-center">
            <span className="text-xs text-slate-400 font-bold mr-1">Align:</span>
            <ToolBtn title="Left"    onClick={() => editor.chain().focus().setTextAlign('left').run()}    active={editor.isActive({textAlign:'left'})}>⬅ Left</ToolBtn>
            <ToolBtn title="Center"  onClick={() => editor.chain().focus().setTextAlign('center').run()}  active={editor.isActive({textAlign:'center'})}>☰ Center</ToolBtn>
            <ToolBtn title="Right"   onClick={() => editor.chain().focus().setTextAlign('right').run()}   active={editor.isActive({textAlign:'right'})}>➡ Right</ToolBtn>
            <ToolBtn title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({textAlign:'justify'})}>≡ Justify</ToolBtn>
            <SEP />
            <ToolBtn title="Clear all formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} cls="text-red-600">✕ Clear Format</ToolBtn>
            <SEP />
            <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↩ Undo</ToolBtn>
            <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↪ Redo</ToolBtn>
          </div>
        )}
      </div>

      {/* ── Document page ── */}
      <div className="flex-1 overflow-y-auto py-8 px-6 flex justify-center" style={{ background: '#c8cdd5' }}>
        <div className="bg-white shadow-2xl w-full"
          style={{ maxWidth: 794, minHeight: 650, padding: '2.5cm 2.2cm', boxSizing: 'border-box' }}>
          <div className="mb-4 pb-2 border-b border-dashed border-slate-200">
            <p className="text-xs text-slate-400 text-center">Pak AITutor — Tutorial Lab</p>
          </div>
          <EditorContent editor={editor} className="tiptap-editor" />
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="bg-indigo-700 text-indigo-100 flex items-center gap-6 px-4 py-1.5 text-xs font-bold flex-shrink-0">
        <span>Words: <b className="text-white">{wordCount}</b></span>
        <span>Characters: <b className="text-white">{charCount}</b></span>
        <span className="ml-auto text-indigo-300">TipTap · Pak AITutor</span>
      </div>
    </div>
  );
}

// ── Add Video Modal (teacher only) ────────────────────────────────────────────
function AddVideoModal({ onClose, onAdd }) {
  const levelKeys = Object.keys(DEFAULT_LEVELS);
  const [form, setForm] = useState({ title: '', videoUrl: '', level: levelKeys[0], desc: '', duration: '', channel: '' });
  const [err, setErr] = useState('');

  const extractId = (url) => {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : url.trim().length === 11 ? url.trim() : null;
  };

  const submit = () => {
    if (!form.title.trim()) return setErr('Title is required.');
    const vid = extractId(form.videoUrl);
    if (!vid) return setErr('Enter a valid YouTube URL or 11-character video ID.');
    if (!form.desc.trim()) return setErr('Description is required.');
    setErr('');
    onAdd({ ...form, videoId: vid, id: 'custom-' + Date.now(), step: '★', custom: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-slate-900">➕ Add Tutorial Video</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-2xl font-bold leading-none">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wide">Class Level</label>
            <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
              className="w-full mt-1 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-indigo-400 outline-none">
              {levelKeys.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wide">Video Title</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. How to Insert a Picture in Word"
              className="w-full mt-1 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 outline-none" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wide">YouTube URL or Video ID</label>
            <input value={form.videoUrl} onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
              placeholder="https://youtube.com/watch?v=XXXXXXXXXXX  or just  XXXXXXXXXXX"
              className="w-full mt-1 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-indigo-400 outline-none" />
            <p className="text-xs text-slate-400 mt-1">Paste the full YouTube link or just the 11-character video ID.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wide">Channel / Source</label>
              <input value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}
                placeholder="e.g. GCFLearnFree"
                className="w-full mt-1 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 outline-none" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wide">Duration</label>
              <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 8 min"
                className="w-full mt-1 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wide">Description</label>
            <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
              placeholder="What will students learn from this video?"
              rows={2}
              className="w-full mt-1 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-400 outline-none resize-none" />
          </div>
          {err && <p className="text-red-500 text-sm font-bold bg-red-50 rounded-xl px-3 py-2">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={submit}
              className="flex-1 py-3 rounded-2xl font-black text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
              Add Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TutorialLab() {
  const { isTeacher } = useAuth();
  const [levels, setLevels] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const merged = JSON.parse(JSON.stringify(DEFAULT_LEVELS));
    Object.entries(saved).forEach(([lvl, vids]) => {
      if (merged[lvl]) merged[lvl].lessons = [...merged[lvl].lessons, ...vids];
    });
    return merged;
  });
  const [level, setLevel]         = useState('Class 1–2');
  const [lessonIdx, setLesson]    = useState(0);
  const [tasksDone, setTasksDone] = useState({});
  const [splitPos, setSplitPos]   = useState(46);
  const [showModal, setShowModal] = useState(false);
  const [pastedUrl, setPastedUrl] = useState('');
  const [embedId, setEmbedId]     = useState('');
  const isDragging = useRef(false);

  const data   = levels[level];
  const lesson = data.lessons[Math.min(lessonIdx, data.lessons.length - 1)];

  // Use teacher-added video ID if available, otherwise use what user pasted
  const activeVideoId = lesson.custom ? lesson.videoId : embedId;

  const extractId = (url) => {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : (url.trim().length === 11 ? url.trim() : null);
  };

  const handlePaste = (e) => {
    const val = e.target.value;
    setPastedUrl(val);
    const id = extractId(val);
    if (id) setEmbedId(id);
    else if (!val) setEmbedId('');
  };

  useEffect(() => { setLesson(0); setTasksDone({}); setPastedUrl(''); setEmbedId(''); }, [level]);
  useEffect(() => {
    if (!lesson.custom) { setPastedUrl(''); setEmbedId(''); }
  }, [lessonIdx]);

  // Drag-to-resize splitter
  const onSplitterDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const c = document.getElementById('split-container');
      if (!c) return;
      const pct = Math.min(68, Math.max(28, ((e.clientX - c.getBoundingClientRect().left) / c.offsetWidth) * 100));
      setSplitPos(pct);
    };
    const onUp = () => { isDragging.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const handleAddVideo = (video) => {
    setLevels(prev => {
      const updated = { ...prev, [video.level]: { ...prev[video.level], lessons: [...prev[video.level].lessons, video] } };
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      saved[video.level] = [...(saved[video.level] || []), video];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      return updated;
    });
    toast.success(`"${video.title}" added to ${video.level}!`);
    setShowModal(false);
  };

  const handleRemove = (idx) => {
    const l = data.lessons[idx];
    if (!l?.custom) return;
    setLevels(prev => {
      const lessons = prev[level].lessons.filter((_, i) => i !== idx);
      const updated = { ...prev, [level]: { ...prev[level], lessons } };
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      saved[level] = (saved[level] || []).filter(v => v.id !== l.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      return updated;
    });
    setLesson(prev => Math.min(prev, data.lessons.length - 2));
    toast.success('Video removed.');
  };

  const doneTasks = Object.values(tasksDone).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-ultra-modern flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar links={sidebarLinks} />

        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Top bar ── */}
          <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
            <div>
              <h1 className="text-lg font-black text-slate-900">🖥️ Tutorial Lab — Microsoft Word for Kids</h1>
              <p className="text-xs text-slate-500 font-medium">Watch step-by-step video · Practice in the real Word editor · Complete tasks</p>
            </div>
            <div className="flex gap-2 ml-auto flex-wrap">
              {Object.keys(levels).map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${level === l
                    ? `bg-gradient-to-r ${levels[l].color} text-white shadow-md`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {l}
                </button>
              ))}
              {isTeacher && (
                <button onClick={() => setShowModal(true)}
                  className="px-4 py-2 rounded-xl text-sm font-black text-white shadow-md"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  ➕ Add Video
                </button>
              )}
            </div>
          </div>

          {/* ── Split screen ── */}
          <div id="split-container" className="flex flex-1 overflow-hidden">

            {/* LEFT: Video panel */}
            <div className="flex flex-col overflow-hidden border-r border-slate-200 bg-slate-900 flex-shrink-0"
              style={{ width: `${splitPos}%`, minWidth: 280 }}>

              {/* Video area */}
              <div className="relative bg-slate-900 flex-shrink-0" style={{ paddingBottom: '56.25%', height: 0 }}>
                {activeVideoId ? (
                  /* ── Live embed when ID is known ── */
                  <iframe
                    key={activeVideoId}
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0&modestbranding=1&autoplay=1`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 'none' }}
                  />
                ) : (
                  /* ── No video yet — show instructions ── */
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-5 gap-4 bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-5xl">🎬</div>
                    <div className="text-center">
                      <p className="text-white font-black text-sm">{lesson.title}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                        Search this topic on YouTube, then paste the link below to watch here.
                      </p>
                    </div>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent('microsoft word tutorial ' + lesson.title + ' for kids beginners')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors flex items-center gap-2 shadow-lg">
                      🔍 Search on YouTube
                    </a>
                    <p className="text-slate-500 text-xs">↓ Paste the YouTube link below to play here</p>
                  </div>
                )}
              </div>

              {/* URL paste bar */}
              <div className="px-3 py-2 bg-slate-700 border-b border-slate-600 flex-shrink-0 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold flex-shrink-0">▶ Paste YouTube link:</span>
                <input
                  type="text"
                  value={pastedUrl}
                  onChange={handlePaste}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 bg-slate-600 text-white text-xs rounded-lg px-2 py-1.5 outline-none placeholder-slate-400 focus:bg-slate-500 transition-colors font-mono"
                />
                {embedId && (
                  <button onClick={() => { setPastedUrl(''); setEmbedId(''); }}
                    className="text-slate-400 hover:text-red-400 text-sm font-bold flex-shrink-0">✕</button>
                )}
              </div>

              {/* Current lesson info */}
              <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${data.badge}`}>{level}</span>
                  <span className="text-xs font-bold text-slate-500">Step {lesson.step}</span>
                  {lesson.channel && <span className="text-xs text-slate-500 ml-auto">📺 {lesson.channel}</span>}
                </div>
                <h2 className="text-white font-black text-sm mt-1.5">{lesson.title}</h2>
                <p className="text-slate-400 text-xs mt-0.5 leading-snug">{lesson.desc}</p>
              </div>

              {/* Lesson list */}
              <div className="flex-1 overflow-y-auto bg-slate-800 p-3 space-y-1.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Step-by-Step Lessons</p>
                {data.lessons.map((l, i) => (
                  <div key={l.id} className="flex items-center gap-1">
                    <button onClick={() => { setLesson(i); setVideoErr(false); }}
                      className={`flex-1 text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
                        i === lessonIdx ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        i === lessonIdx ? 'bg-white text-indigo-600' : 'bg-slate-600 text-slate-400'}`}>
                        {l.custom ? '★' : l.step}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs leading-tight truncate">{l.title}</p>
                        <p className={`text-xs mt-0.5 ${i === lessonIdx ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {l.duration}{l.custom ? ' · Teacher Added' : ''}
                        </p>
                      </div>
                      {i === lessonIdx && <span className="text-xs">▶</span>}
                    </button>
                    {isTeacher && l.custom && (
                      <button onClick={() => handleRemove(i)} title="Remove"
                        className="w-6 h-6 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white text-xs transition-all flex items-center justify-center flex-shrink-0">✕</button>
                    )}
                  </div>
                ))}

                {/* Practice tasks */}
                <div className={`mt-4 p-3 rounded-2xl border ${data.border} ${data.bg}`}>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wide mb-2.5">
                    Practice Tasks ({doneTasks}/{data.tasks.length})
                  </p>
                  <div className="space-y-2">
                    {data.tasks.map((task, i) => (
                      <label key={i} className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!tasksDone[i]}
                          onChange={e => setTasksDone(p => ({ ...p, [i]: e.target.checked }))}
                          className="mt-0.5 accent-indigo-600 w-4 h-4 flex-shrink-0" />
                        <span className={`text-xs font-medium leading-snug ${tasksDone[i] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {task}
                        </span>
                      </label>
                    ))}
                  </div>
                  {doneTasks === data.tasks.length && (
                    <p className="text-center text-xs font-black text-green-600 mt-2">🎉 All tasks done! Excellent work!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Drag splitter */}
            <div onMouseDown={onSplitterDown}
              className="w-2 bg-slate-300 hover:bg-indigo-400 cursor-col-resize flex-shrink-0 transition-colors flex items-center justify-center">
              <div className="w-0.5 h-10 bg-slate-400 rounded-full" />
            </div>

            {/* RIGHT: TipTap Word Editor */}
            <WordEditor />
          </div>
        </div>
      </div>

      {showModal && <AddVideoModal onClose={() => setShowModal(false)} onAdd={handleAddVideo} />}

      {/* TipTap editor styles */}
      <style>{`
        .tiptap-editor .ProseMirror {
          min-height: 500px;
          outline: none;
          line-height: 1.7;
          font-size: 14px;
          font-family: Arial, sans-serif;
          color: #1a1a1a;
        }
        .tiptap-editor .ProseMirror h1 { font-size: 2em !important; font-weight: 900 !important; margin: 0.6em 0 0.3em; line-height: 1.2; }
        .tiptap-editor .ProseMirror h2 { font-size: 1.5em !important; font-weight: 800 !important; margin: 0.5em 0 0.3em; line-height: 1.3; }
        .tiptap-editor .ProseMirror h3 { font-size: 1.2em !important; font-weight: 700 !important; margin: 0.4em 0 0.3em; line-height: 1.4; }
        .tiptap-editor .ProseMirror p  { margin: 0.3em 0; }
        .tiptap-editor .ProseMirror ul { list-style-type: disc;    padding-left: 1.5em; margin: 0.4em 0; }
        .tiptap-editor .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.4em 0; }
        .tiptap-editor .ProseMirror li { margin: 0.2em 0; }
        .tiptap-editor .ProseMirror blockquote { border-left: 4px solid #6366f1; padding-left: 1em; color: #64748b; margin: 0.5em 0; font-style: italic; }
        .tiptap-editor .ProseMirror code { background: #f1f5f9; border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 0.9em; }
        .tiptap-editor .ProseMirror hr { border: none; border-top: 2px solid #e2e8f0; margin: 1em 0; }
        .tiptap-editor .ProseMirror p.is-empty::before {
          content: 'Start typing here… watch the video and follow each step!';
          color: #94a3b8;
          pointer-events: none;
          font-style: italic;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  );
}
