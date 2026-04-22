import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { coursesAPI, uploadAPI, quizAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizTopic, setQuizTopic] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const sidebarLinks = [
    { path: '/teacher', label: 'Home', icon: '🏠' },
    { path: '/teacher', label: 'My Courses', icon: '📚' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getMyCourses();
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await coursesAPI.create(newCourse);
      toast.success('Course created successfully!');
      setShowCreateCourse(false);
      setNewCourse({ title: '', description: '' });
      fetchCourses();
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedCourse || !quizTopic) {
      toast.error('Please select a course and enter a topic');
      return;
    }

    setGeneratingQuiz(true);
    try {
      await quizAPI.generate({
        courseId: selectedCourse,
        topic: quizTopic,
        numberOfQuestions: 5
      });
      toast.success('Quiz generated successfully!');
      setQuizTopic('');
      setSelectedCourse(null);
    } catch (error) {
      toast.error('Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleFileUpload = async (courseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);

    try {
      const response = await uploadAPI.document(formData);
      toast.success(`Uploaded: ${response.data.filename} (${response.data.chunksCreated} chunks)`);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Teacher Dashboard</h1>
                <p className="text-slate-400">Manage your courses and create content</p>
              </div>
              <button
                onClick={() => setShowCreateCourse(true)}
                className="btn-primary"
              >
                + Create Course
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" message="Loading courses..." />
              </div>
            ) : (
              <>
                {/* AI Quiz Generator */}
                <div className="glassmorphism p-6 rounded-xl mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">✨ AI Quiz Generator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={selectedCourse || ''}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      className="input-field"
                      placeholder="Quiz topic (e.g., Algebra Basics)"
                    />
                    <button
                      onClick={handleGenerateQuiz}
                      disabled={generatingQuiz}
                      className="btn-primary"
                    >
                      {generatingQuiz ? 'Generating...' : '⚡ Generate Quiz'}
                    </button>
                  </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="glassmorphism p-6 rounded-xl card-hover">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2">{course.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-primary">{course.document_count || 0}</p>
                          <p className="text-xs text-slate-400">Documents</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-secondary">{course.quiz_count || 0}</p>
                          <p className="text-xs text-slate-400">Quizzes</p>
                        </div>
                      </div>

                      <label className="btn-secondary w-full block text-center cursor-pointer">
                        📄 Upload Material
                        <input
                          type="file"
                          accept=".pdf,.txt"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(course.id, file);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>

                {courses.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-slate-400 mb-4">No courses yet. Create your first course to get started!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glassmorphism p-8 rounded-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Course Title</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Introduction to Algebra"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="Brief description of the course"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  Create Course
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateCourse(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
