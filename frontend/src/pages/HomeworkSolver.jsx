import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UrduToggle from '../components/UrduToggle';
import LoadingSpinner from '../components/LoadingSpinner';
import { homeworkAPI } from '../utils/api';
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
  { path: '/student/gamification', label: 'Achievements', icon: '🏆' },
  { path: '/student/videos', label: 'Videos', icon: '🎬' },
];

const subjects = [
  { label: 'Mathematics', icon: '📐', value: 'mathematics' },
  { label: 'Physics',     icon: '⚡', value: 'physics' },
  { label: 'Chemistry',   icon: '🧪', value: 'chemistry' },
  { label: 'Biology',     icon: '🌿', value: 'biology' },
  { label: 'English',     icon: '📖', value: 'english' },
  { label: 'General',     icon: '🎯', value: 'general' },
];

// Render solution text with bold headings
function SolutionText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div className="space-y-3">
      {text.split('\n').filter(l => l.trim()).map((line, i) => {
        const isBold = line.startsWith('**') || line.startsWith('##') || /^\d+\.\s/.test(line);
        const clean = line.replace(/\*\*/g, '').replace(/^##\s*/, '').replace(/^#\s*/, '');
        return (
          <p key={i} className={isBold ? 'text-lg font-black text-slate-900 mt-4' : 'text-base text-slate-700 leading-relaxed'}>
            {clean}
          </p>
        );
      })}
    </div>
  );
}

const HomeworkSolver = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [subject, setSubject] = useState('mathematics');
  const [language, setLanguage] = useState('english');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const solutionRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSolve = async () => {
    if (!imageFile) { toast.error('Please upload an image first'); return; }
    setLoading(true); setSolution('');
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('subject', subject);
      formData.append('language', language);
      const response = await homeworkAPI.solve(formData);
      setSolution(response.data.solution);
      toast.success('Solution generated!');
      setTimeout(() => solutionRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch { toast.error('Failed to solve homework'); }
    finally { setLoading(false); }
  };

  const handleReset = () => { setImageFile(null); setImagePreview(''); setSolution(''); };

  const handlePrint = () => {
    const subjectLabel = subjects.find(s => s.value === subject)?.label || 'General';
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${subjectLabel} — Homework Solution</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;font-size:16px;line-height:1.8;}
      h1{font-size:26px;font-weight:900;margin-bottom:4px;color:#0f172a;}
      .sub{font-size:13px;color:#64748b;margin-bottom:20px;font-weight:600;}
      p{margin-bottom:8px;color:#374151;}
      .bold{font-size:18px;font-weight:900;color:#0f172a;margin-top:16px;}
      </style></head><body>
      <h1>${subjectLabel}</h1>
      <div class="sub">Homework Solution • Pak AI Tutor</div>
      ${solution.split('\n').filter(l=>l.trim()).map(line => {
        const isBold = line.startsWith('**') || line.startsWith('##') || /^\d+\./.test(line);
        const clean = line.replace(/\*\*/g,'').replace(/^##?\s*/,'');
        return isBold ? `<p class="bold">${clean}</p>` : `<p>${clean}</p>`;
      }).join('')}
      </body></html>`);
    win.document.close();
    win.print();
  };

  const handlePDF = () => {
    const subjectLabel = subjects.find(s => s.value === subject)?.label || 'General';
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${subjectLabel} — Homework Solution</title>
      <style>
        @media print { @page { size: A4; margin: 20mm; } }
        body{font-family:'Segoe UI',Arial,sans-serif;padding:32px;font-size:16px;line-height:1.9;max-width:800px;margin:0 auto;}
        .header{border-left:6px solid #4f46e5;padding:12px 20px;margin-bottom:28px;background:#f8fafc;}
        h1{font-size:28px;font-weight:900;margin:0;color:#0f172a;}
        .sub{font-size:13px;color:#64748b;margin-top:4px;font-weight:600;}
        .bold{font-size:18px;font-weight:900;color:#0f172a;margin-top:20px;margin-bottom:6px;}
        p{margin:4px 0;color:#374151;}
        .footer{margin-top:32px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;}
      </style></head><body>
      <div class="header">
        <h1>${subjectLabel}</h1>
        <div class="sub">Homework Solution • Pak AI Tutor</div>
      </div>
      ${solution.split('\n').filter(l=>l.trim()).map(line => {
        const isBold = line.startsWith('**') || line.startsWith('##') || /^\d+\./.test(line);
        const clean = line.replace(/\*\*/g,'').replace(/^##?\s*/,'');
        return isBold ? `<div class="bold">${clean}</div>` : `<p>${clean}</p>`;
      }).join('')}
      <div class="footer">Generated by Pak AI Tutor • AI-Powered Education Platform</div>
      <script>window.onload=()=>{ window.print(); }</script>
      </body></html>`);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-5 md:p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Homework Solver</h1>
              <p className="text-slate-500 font-medium mt-1">Upload a photo of your homework — get AI step-by-step solutions</p>
            </div>
            <UrduToggle isUrdu={language === 'urdu'} onToggle={() => setLanguage(language === 'english' ? 'urdu' : 'english')} />
          </div>

          <div className="space-y-5">

            {/* Upload Area */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 pt-5 pb-3 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">📸 Upload Homework Photo</h3>
                <p className="text-slate-500 font-medium mt-0.5">Drag & drop or click — JPG, PNG, HEIC</p>
              </div>

              <div
                onDragEnter={handleDrag} onDragLeave={handleDrag}
                onDragOver={handleDrag} onDrop={handleDrop}
                className={`m-5 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                  dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
                style={{ minHeight: '340px' }}
              >
                {imagePreview ? (
                  <div className="p-5 flex flex-col items-center">
                    <img src={imagePreview} alt="Homework preview"
                      className="w-full rounded-2xl shadow-md object-contain"
                      style={{ maxHeight: '480px' }} />
                    <button onClick={handleReset}
                      className="mt-4 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 font-bold text-sm rounded-xl transition-all">
                      ✕ Remove & Upload New
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer py-16 px-6">
                    <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                      <span className="text-5xl">📸</span>
                    </div>
                    <p className="text-xl font-black text-slate-700 mb-2">
                      {dragActive ? 'Drop it here!' : 'Drag & Drop your homework photo'}
                    </p>
                    <p className="text-slate-400 font-medium mb-6">or click anywhere to browse files</p>
                    <div className="px-8 py-3.5 rounded-xl font-black text-white text-base shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' }}>
                      📁 Choose File
                    </div>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])} />
                  </label>
                )}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-4">📚 Select Subject</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {subjects.map((subj) => (
                  <button key={subj.value} onClick={() => setSubject(subj.value)}
                    className={`py-4 px-2 rounded-2xl font-black text-base transition-all flex flex-col items-center gap-2 ${
                      subject === subj.value
                        ? 'text-white shadow-lg'
                        : 'bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    style={subject === subj.value ? { background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', border: 'none' } : {}}>
                    <span className="text-3xl">{subj.icon}</span>
                    <span className="text-sm">{subj.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Solve Button */}
            <button onClick={handleSolve} disabled={!imageFile || loading}
              className="w-full py-5 rounded-2xl font-black text-white text-xl transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: (!imageFile || loading) ? '#cbd5e1' : 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
                color: (!imageFile || loading) ? '#64748b' : 'white',
                boxShadow: (!imageFile || loading) ? 'none' : '0 8px 25px rgba(29,78,216,0.4)',
              }}>
              {loading ? (<><LoadingSpinner size="sm" /><span>Solving your homework...</span></>) : (<><span className="text-2xl">⚡</span><span>Solve Homework with AI</span></>)}
            </button>

            {/* Solution */}
            {(loading || solution) && (
              <div ref={solutionRef} className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-xl font-black text-slate-900">💡 AI Solution</h3>
                  {solution && (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => navigator.clipboard.writeText(solution).then(() => toast.success('Copied!'))}
                        className="px-4 py-2 font-black text-sm rounded-xl transition-all text-white"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' }}>
                        📋 Copy Solution
                      </button>
                      <button onClick={handlePDF}
                        className="px-4 py-2 font-black text-sm rounded-xl transition-all text-white"
                        style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                        📄 Generate PDF
                      </button>
                      <button onClick={handlePrint}
                        className="px-4 py-2 font-black text-sm rounded-xl transition-all text-white"
                        style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                        🖨️ Print
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 md:p-8">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="loader-modern mb-4"></div>
                      <p className="text-slate-700 font-black text-lg">Analyzing your homework...</p>
                      <p className="text-slate-400 font-medium mt-1">AI is working on step-by-step solution</p>
                    </div>
                  ) : (
                    <div className={language === 'urdu' ? 'text-right font-urdu' : ''}>
                      <SolutionText text={solution} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loading && !solution && (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-14 text-center">
                <div className="text-6xl mb-4">💡</div>
                <p className="font-black text-slate-600 text-xl">Solution will appear here</p>
                <p className="text-slate-400 font-medium mt-2 text-base">Upload your homework photo and click "Solve"</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeworkSolver;
