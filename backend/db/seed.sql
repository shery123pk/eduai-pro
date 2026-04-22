-- Seed data for testing EduAI Pro

-- Insert test teacher (password: teacher123)
INSERT INTO users (name, email, password, role) VALUES
('Dr. Ahmad Khan', 'ahmad.khan@eduai.com', '$2a$10$rF8YZ9X1lXKqQx6J6jK6WeKvGxKYZ8xK1ZxK1ZxK1ZxK1ZxK1ZxK1', 'teacher'),
('Prof. Sarah Ahmed', 'sarah.ahmed@eduai.com', '$2a$10$rF8YZ9X1lXKqQx6J6jK6WeKvGxKYZ8xK1ZxK1ZxK1ZxK1ZxK1ZxK1', 'teacher');

-- Insert test students (password: student123)
INSERT INTO users (name, email, password, role) VALUES
('Ali Hassan', 'ali@student.com', '$2a$10$rF8YZ9X1lXKqQx6J6jK6WeKvGxKYZ8xK1ZxK1ZxK1ZxK1ZxK1ZxK1', 'student'),
('Fatima Siddiqui', 'fatima@student.com', '$2a$10$rF8YZ9X1lXKqQx6J6jK6WeKvGxKYZ8xK1ZxK1ZxK1ZxK1ZxK1ZxK1', 'student'),
('Hassan Raza', 'hassan@student.com', '$2a$10$rF8YZ9X1lXKqQx6J6jK6WeKvGxKYZ8xK1ZxK1ZxK1ZxK1ZxK1ZxK1', 'student');

-- Insert test courses
INSERT INTO courses (title, description, teacher_id)
SELECT
  'Introduction to Algebra',
  'Learn fundamental algebraic concepts including equations, functions, and graphing',
  id
FROM users WHERE email = 'ahmad.khan@eduai.com';

INSERT INTO courses (title, description, teacher_id)
SELECT
  'Physics 101',
  'Introduction to classical mechanics, forces, motion, and energy',
  id
FROM users WHERE email = 'sarah.ahmed@eduai.com';

INSERT INTO courses (title, description, teacher_id)
SELECT
  'English Grammar Mastery',
  'Master English grammar, sentence structure, and writing skills',
  id
FROM users WHERE email = 'ahmad.khan@eduai.com';

-- Note: Embeddings and quiz data will be generated dynamically through the API
