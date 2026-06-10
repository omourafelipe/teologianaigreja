export interface Profile {
  id: string;
  role: "student" | "teacher";
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category_id: string;
  is_published: boolean;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string; // Markdown
  order: number;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation?: string;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
}

export interface QuizAnswer {
  id: string;
  user_id: string;
  quiz_id: string;
  selected_option_index: number;
  is_correct: boolean;
}

// Representa a árvore completa de dados relacionais que usamos para mocking rápido de cursos
export interface FullModule extends Module {
  lessons: FullLesson[];
}

export interface FullLesson extends Lesson {
  quizzes: Quiz[];
}

export interface FullCourse extends Course {
  modules: FullModule[];
}
