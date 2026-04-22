import { useState } from 'react';
import Navbar from '../components/Navbar';
import UrduToggle from '../components/UrduToggle';
import MathRenderer from '../components/MathRenderer';
import LoadingSpinner from '../components/LoadingSpinner';
import { homeworkAPI } from '../utils/api';
import toast from 'react-hot-toast';

const HomeworkSolver = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [subject, setSubject] = useState('mathematics');
  const [language, setLanguage] = useState('english');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'General'];

  const handleFileChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSolve = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }

    setLoading(true);
    setSolution('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('subject', subject);
      formData.append('language', language);

      const response = await homeworkAPI.solve(formData);
      setSolution(response.data.solution);
      toast.success('Solution generated!');
    } catch (error) {
      toast.error('Failed to solve homework');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview('');
    setSolution('');
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Homework Solver</h1>
            <p className="text-slate-400">Upload a photo of your homework and get step-by-step solutions</p>
          </div>
          <UrduToggle isUrdu={language === 'urdu'} onToggle={() => setLanguage(language === 'english' ? 'urdu' : 'english')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Upload & Settings */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="glassmorphism p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">Upload Homework</h3>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive ? 'border-primary bg-primary/10' : 'border-slate-600'
                }`}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-w-full max-h-64 mx-auto rounded-lg" />
                    <button
                      onClick={handleReset}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-6xl mb-4">📸</div>
                    <p className="text-white font-semibold mb-2">Drag & drop or click to upload</p>
                    <p className="text-slate-400 text-sm mb-4">Support: JPG, PNG, HEIC</p>
                    <label className="btn-primary cursor-pointer inline-block">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="glassmorphism p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">Subject</h3>
              <div className="grid grid-cols-2 gap-3">
                {subjects.map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSubject(subj.toLowerCase())}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      subject === subj.toLowerCase()
                        ? 'gradient-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Solve Button */}
            <button
              onClick={handleSolve}
              disabled={!imageFile || loading}
              className="w-full btn-primary py-4 text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span>Solving...</span>
                </div>
              ) : (
                '⚡ Solve Homework'
              )}
            </button>
          </div>

          {/* Right: Solution */}
          <div className="glassmorphism p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4">Solution</h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <LoadingSpinner size="lg" message="Analyzing your homework..." />
              </div>
            ) : solution ? (
              <div className={`space-y-4 ${language === 'urdu' ? 'text-right font-urdu' : ''}`}>
                <MathRenderer content={solution} />

                <div className="pt-4 border-t border-slate-600">
                  <button
                    onClick={() => navigator.clipboard.writeText(solution)}
                    className="btn-secondary w-full"
                  >
                    📋 Copy Solution
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-slate-400">
                  Upload an image and click "Solve Homework" to see the solution here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeworkSolver;
