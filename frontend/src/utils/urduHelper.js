// Urdu text helper functions

// Check if text contains Urdu characters
export const isUrdu = (text) => {
  if (!text) return false;
  const urduRegex = /[\u0600-\u06FF]/;
  return urduRegex.test(text);
};

// Apply Urdu font class
export const urduFont = "font-urdu";

// Apply RTL direction
export const urduDir = "dir='rtl' text-right";

// Get language-specific class names
export const getLanguageClasses = (language) => {
  return language === 'urdu' ? `${urduFont} text-right` : '';
};

// Translations
export const translations = {
  english: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    submit: 'Submit',
    cancel: 'Cancel',
    dashboard: 'Dashboard',
    courses: 'Courses',
    chat: 'Chat',
    homework: 'Homework Solver',
    tutor: 'Smart Tutor',
    quiz: 'Quizzes',
    weakArea: 'Weak Areas',
    logout: 'Logout',
    teacher: 'Teacher',
    student: 'Student',
    send: 'Send',
    solve: 'Solve',
    upload: 'Upload',
    generate: 'Generate'
  },
  urdu: {
    login: 'لاگ ان',
    register: 'رجسٹر',
    email: 'ای میل',
    password: 'پاس ورڈ',
    name: 'نام',
    submit: 'جمع کرائیں',
    cancel: 'منسوخ',
    dashboard: 'ڈیش بورڈ',
    courses: 'کورسز',
    chat: 'چیٹ',
    homework: 'ہوم ورک حل کنندہ',
    tutor: 'سمارٹ ٹیوٹر',
    quiz: 'کوئز',
    weakArea: 'کمزور شعبے',
    logout: 'لاگ آؤٹ',
    teacher: 'استاد',
    student: 'طالب علم',
    send: 'بھیجیں',
    solve: 'حل کریں',
    upload: 'اپ لوڈ',
    generate: 'بنائیں'
  }
};

// Get translation
export const t = (key, language = 'english') => {
  return translations[language]?.[key] || translations.english[key] || key;
};
