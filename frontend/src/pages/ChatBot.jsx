import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UrduToggle from '../components/UrduToggle';
import ChatMessage from '../components/ChatMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { detectShape } from '../components/ShapeRenderer';
import { chatAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ChatBot = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const messagesEndRef = useRef(null);

  const sidebarLinks = [
    { path: '/student', label: 'Home', icon: '🏠' },
    { path: '/student/chat', label: 'AI Chat', icon: '💬' },
    { path: '/student/homework', label: 'Homework Solver', icon: '📝' },
    { path: '/student/tutor', label: 'Smart Tutor', icon: '🎯' },
    { path: '/student/quiz', label: 'Quizzes', icon: '📊' },
    { path: '/student/weak-areas', label: 'Weak Areas', icon: '📈' },
    { path: '/student/gamification', label: 'Achievements', icon: '🏆' },
    { path: '/student/videos', label: 'Videos', icon: '🎬' },
  ];

  const suggestedQuestions = [
    { text: 'Draw a circle and explain it', icon: '⭕', category: 'Shapes' },
    { text: 'Show me a 3D cube', icon: '🎲', category: '3D Shapes' },
    { text: 'What is a triangle?', icon: '📐', category: 'Geometry' },
    { text: 'Explain the Pythagorean theorem', icon: '📚', category: 'Math' },
    { text: 'How do I solve a linear equation?', icon: '🎯', category: 'Algebra' },
    { text: 'Draw a pyramid and explain volume', icon: '🔺', category: '3D Shapes' },
  ];

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchChatHistory(); }, [selectedCourse]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCourses = async () => {
    try {
      const response = await chatAPI.getCourses();
      setCourses(response.data.courses);
      if (response.data.courses.length > 0) {
        setSelectedCourse(response.data.courses[0].id);
      }
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory(selectedCourse);
      setMessages(response.data.messages || []);
    } catch {}
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !selectedCourse) return;

    const userMessage = { role: 'user', content: input };
    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Detect shape request from user input
    const detectedShape = detectShape(currentInput);

    try {
      const response = await chatAPI.sendMessage({
        courseId: selectedCourse,
        message: currentInput,
        language,
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources,
        shape: detectedShape,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch {
      toast.error('Failed to get response');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 flex flex-col p-4 md:p-6">
          <div className="max-w-4xl mx-auto w-full flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>

            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm flex-shrink-0">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900">AI Chat Assistant</h1>
                    <p className="text-slate-500 text-xs font-medium">
                      {selectedCourse
                        ? `Chatting about ${courses.find(c => c.id === selectedCourse)?.title || 'course'}`
                        : 'Select a course to start'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <UrduToggle
                    isUrdu={language === 'urdu'}
                    onToggle={() => setLanguage(language === 'english' ? 'urdu' : 'english')}
                  />
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="flex-1 md:flex-none bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-400 min-w-[180px] text-sm"
                  >
                    {loadingCourses ? (
                      <option>Loading...</option>
                    ) : courses.length === 0 ? (
                      <option>No courses available</option>
                    ) : (
                      courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm min-h-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-2">

                {!selectedCourse ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="text-7xl mb-4">💬</div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Welcome to AI Chat!</h3>
                    <p className="text-slate-500 mb-6 font-medium">Select a course above to start learning with AI</p>
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      {[
                        { icon: '📐', label: 'Draw Shapes' },
                        { icon: '🎲', label: '3D Objects' },
                        { icon: '📚', label: 'Explain Concepts' },
                        { icon: '🎯', label: 'Practice Problems' },
                      ].map((f, i) => (
                        <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-left">
                          <div className="text-2xl mb-1">{f.icon}</div>
                          <p className="text-sm font-bold text-indigo-700">{f.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="text-6xl mb-4">👋</div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Start Learning!</h3>
                    <p className="text-slate-500 mb-6 font-medium">Ask me anything — including drawing shapes and 3D objects!</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
                      {suggestedQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(question.text)}
                          className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl p-3 text-left transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{question.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-indigo-500 mb-0.5">{question.category}</p>
                              <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">
                                {question.text}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <ChatMessage key={idx} message={msg} isUser={msg.role === 'user'} language={language} />
                    ))}
                    {loading && (
                      <div className="flex justify-start mb-4">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0 mr-2 mt-1">
                          AI
                        </div>
                        <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                          <div className="flex items-center gap-3">
                            <LoadingSpinner size="sm" />
                            <span className="text-slate-500 text-sm font-medium">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              {selectedCourse && (
                <div className="border-t border-slate-100 p-4 bg-slate-50 flex-shrink-0">
                  <form onSubmit={handleSend} className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={language === 'urdu' ? 'اپنا سوال یہاں لکھیں...' : 'Type your question... try "draw a circle" or "show a 3D cube"'}
                      className={`flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all text-sm font-medium ${
                        language === 'urdu' ? 'text-right font-urdu' : ''
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl transition-all shadow-md disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>{language === 'urdu' ? 'بھیجیں →' : 'Send →'}</span>
                      )}
                    </button>
                  </form>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400 font-medium">Try:</span>
                    {['draw a circle', 'show 3D cube', 'explain sphere'].map((tip, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(tip)}
                        className="text-xs text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all"
                      >
                        {tip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatBot;
