export interface Profile {
  id: string;
  role: "student" | "teacher" | "admin" | "editor" | "monitor";
  name: string;
  email: string;
  xp?: number;
  level?: string;
  streak?: number;
  max_streak?: number;
  last_activity_date?: string;
  badges?: string[];
  study_time_seconds?: number;
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
  navigation_mode?: "free" | "progressive" | "min_score";
  min_score_required?: number; // e.g. 70 (porcentagem)
  is_archived?: boolean;
  version?: string;
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
  content_type?: "text" | "video" | "audio" | "pdf";
  media_url?: string;
  video_duration?: number;
  transcript?: string;
  pdf_url?: string;
  audio_url?: string;
  estimated_reading_time?: number; // em minutos
}

export interface Quiz {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation?: string;
  type?: "multiple_choice" | "true_false" | "short_answer" | "association" | "ordering" | "open";
  association_pairs?: Record<string, string>; // para questões de associação
  ordering_sequence?: string[]; // para questões de ordenação
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  last_accessed_at?: string;
  study_time_seconds?: number;
  current_audio_position?: number; // em segundos (resume point)
  notes?: string;
}

export interface QuizAnswer {
  id: string;
  user_id: string;
  quiz_id: string;
  selected_option_index?: number;
  text_answer?: string; // para respostas curtas/abertas
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  lesson_id: string;
  score: number; // e.g. 80
  total_questions: number;
  is_passed: boolean;
  answers: Record<string, any>;
  attempt_number: number;
  created_at: string;
}

export interface SelfAssessment {
  id: string;
  user_id: string;
  lesson_id: string;
  comprehension: number; // 1 a 5
  confidence: number; // 1 a 5
  clarity: boolean;
  created_at: string;
}

export interface Poll {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  selected_option_index: number;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  target_type: "course" | "lesson";
  target_id: string;
  content: string;
  likes: number;
  liked_by: string[]; // lista de user_ids
  parent_id?: string; // para respostas
  created_at: string;
}

export interface ForumTopic {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  category: "duvidas" | "debates" | "testemunhos" | "sugestoes";
  title: string;
  content: string;
  likes: number;
  liked_by: string[];
  replies_count: number;
  created_at: string;
}

export interface ForumReply {
  id: string;
  topic_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  content: string;
  likes: number;
  liked_by: string[];
  created_at: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  members_count: number;
  joined_by_user?: boolean;
  created_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  content: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  user_name: string;
  course_id: string;
  course_title: string;
  hours: number;
  validation_code: string;
  issued_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: "lessons" | "modules" | "quizzes" | "xp";
  target: number;
  current: number;
  xp_reward: number;
  is_completed: boolean;
  expires_at: string;
}

export interface LessonNote {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  highlighted_text?: string;
  created_at: string;
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
