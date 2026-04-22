import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import UrduToggle from '../components/UrduToggle';
import ChatMessage from '../components/ChatMessage';
import LoadingSpinner from '../components/LoadingSpinner';
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

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchChatHistory();
    }
  }, [selectedCourse]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCourses = async () => {
    try {
      const response = await chatAPI.getCourses();
      setCourses(response.data.courses);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory(selectedCourse);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedCourse) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        courseId: selectedCourse,
        message: input,
        language
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages((prev) => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4">
        {/* Header */}
        <div className="glassmorphism p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div>
                <h1 className="text-2xl font-bold gradient-text">AI Chat Assistant</h1>
                <p className="text-slate-400 text-sm">Ask questions about your course materials</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <UrduToggle isUrdu={language === 'urdu'} onToggle={() => setLanguage(language === 'english' ? 'urdu' : 'english')} />

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input-field min-w-[200px]"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 glassmorphism rounded-xl p-6 overflow-y-auto mb-4 min-h-[500px]">
          {!selectedCourse ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Course to Start</h3>
              <p className="text-slate-400">Choose a course from the dropdown above to begin chatting</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-xl font-bold text-white mb-2">Start a Conversation</h3>
              <p className="text-slate-400">Ask me anything about your course materials!</p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-slate-500">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['What is algebra?', 'Explain quadratic equations', 'Give me an example'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} isUser={msg.role === 'user'} />
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="glassmorphism px-4 py-3 rounded-lg">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="glassmorphism p-4 rounded-xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'urdu' ? 'اپنا سوال یہاں لکھیں...' : 'Type your question here...'}
              className={`input-field flex-1 ${language === 'urdu' ? 'text-right font-urdu' : ''}`}
              disabled={!selectedCourse || loading}
            />
            <button
              type="submit"
              disabled={!selectedCourse || loading || !input.trim()}
              className="btn-primary min-w-[120px]"
            >
              {loading ? 'Sending...' : language === 'urdu' ? 'بھیجیں' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
