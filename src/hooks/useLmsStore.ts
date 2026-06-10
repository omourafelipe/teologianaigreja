import { useState, useEffect } from "react";
import {
  Profile,
  Category,
  Course,
  Module,
  Lesson,
  Quiz,
  Progress,
  QuizAnswer
} from "@/types/database.types";

// Tabelas globais em memória
let globalProfiles: Profile[] = [];
let globalCategories: Category[] = [];
let globalCourses: Course[] = [];
let globalModules: Module[] = [];
let globalLessons: Lesson[] = [];
let globalQuizzes: Quiz[] = [];
let globalProgress: Progress[] = [];
let globalQuizAnswers: QuizAnswer[] = [];
let globalCurrentUser: Profile | null = null;

const listeners = new Set<() => void>();
const isClient = typeof window !== "undefined";

// Seeding inicial
const runDatabaseSeeding = () => {
  const seededProfiles: Profile[] = [
    { id: "prof-123", role: "teacher", name: "Professor EBD", email: "professor@ebd.com" },
    { id: "stud-123", role: "student", name: "Aluno EBD", email: "aluno@ebd.com" }
  ];

  const seededCategories: Category[] = [
    { id: "cat-biblia", name: "Estudo Bíblico", description: "Cursos de interpretação, exegese e panorama bíblico." },
    { id: "cat-teologia", name: "Teologia Sistemática", description: "Grandes doutrinas e tópicos sistemáticos." }
  ];

  const seededCourses: Course[] = [
    {
      id: "course-hermeneutica",
      title: "Fundamentos da Hermenêutica Bíblica",
      description: "Aprenda os princípios fundamentais para interpretar as Escrituras com fidelidade, considerando abismos históricos, culturais e linguísticos.",
      category_id: "cat-biblia",
      is_published: true
    }
  ];

  const seededModules: Module[] = [
    { id: "mod-1", course_id: "course-hermeneutica", title: "Módulo 1: O que é Interpretação?", order: 1 },
    { id: "mod-2", course_id: "course-hermeneutica", title: "Módulo 2: O Contexto e a História", order: 2 }
  ];

  const seededLessons: Lesson[] = [
    {
      id: "lesson-intro",
      module_id: "mod-1",
      title: "Introdução: A Necessidade da Hermenêutica",
      content: `# Introdução à Hermenêutica

A **hermenêutica bíblica** é a ciência e a arte de interpretar as Escrituras Sagradas. O termo deriva do grego *hermeneuein*, que significa "explicar", "interpretar" ou "traduzir".

## Por que a interpretação é necessária?

Muitas pessoas afirmam: *"Eu não preciso interpretar a Bíblia, eu apenas a leio e aceito o que ela diz"*. Embora essa seja uma atitude piedosa, ela ignora uma realidade fundamental: **todo leitor é um intérprete**.

Quando lemos um texto antigo, automaticamente passamos as palavras pelo filtro da nossa cultura, idioma e experiências. A hermenêutica nos ajuda a superar três grandes abismos:

1. **O Abismo Histórico:** Estamos separados dos eventos bíblicos por milhares de anos. A forma como o mundo funcionava era drasticamente diferente.
2. **O Abismo Cultural:** Os costumes, as tradições e a visão de mundo dos hebreus antigos ou dos cristãos do primeiro século em Israel, Grécia ou Roma não são os mesmos do leitor moderno.
3. **O Abismo Linguístico:** A Bíblia foi escrita em Hebraico, Aramaico e Grego. Toda tradução já é, em si mesma, uma forma de interpretação.

## Os Três Passos Básicos do Estudo Bíblico

Para garantir uma leitura saudável na Escola Bíblica, recomendamos o método indutivo, que se divide em três etapas fundamentais:

*   **Observação:** O que o texto diz? (Identificar personagens, verbos, repetições).
*   **Interpretação:** O que o texto significava para os leitores originais?
*   **Aplicação:** Como esse princípio eterno se aplica à minha vida hoje?

Com essas ferramentas em mãos, o texto sagrado se abre com muito mais clareza, evitando que coloquemos nossas próprias ideias na boca de Deus (o que chamamos de *eisegese*).`,
      order: 1
    },
    {
      id: "lesson-contexto",
      module_id: "mod-2",
      title: "O Contexto Literário e Histórico",
      content: `# O Contexto Literário e Histórico

Na interpretação de qualquer texto, uma regra se destaca acima de quase todas as outras: **o contexto é rei**. 

## O Perigo de Textos Fora do Contexto

A famosa frase *"um texto fora de contexto vira um pretexto para uma heresia"* resume um dos erros mais comuns na leitura das Escrituras. 

Quando isolamos um versículo de seu parágrafo, capítulo ou livro, podemos fazê-lo dizer praticamente qualquer coisa que desejarmos.

### O Contexto Literário
Refere-se ao texto que cerca a passagem que você está estudando. Para compreender um versículo:
1. Leia a frase completa.
2. Leia o parágrafo inteiro.
3. Compreenda o capítulo.
4. Identifique o gênero literário (Poesia, Lei, Epístola, Profecia, Narrativa).

### O Contexto Histórico-Cultural
Refere-se ao mundo do autor e dos leitores originais:
* Quem escreveu?
* Para quem foi escrito?
* Qual era a situação social, política ou geográfica da época?
* O que as palavras significavam naquele ambiente cultural específico?`,
      order: 1
    }
  ];

  const seededQuizzes: Quiz[] = [
    {
      id: "quiz-1",
      lesson_id: "lesson-intro",
      question: "Qual o significado de eisegese?",
      options: [
        "Extrair o sentido original pretendido pelo autor do texto.",
        "A tradução literal de palavras em hebraico para o grego.",
        "Inserir ideias próprias ou preconceitos na interpretação do texto bíblico.",
        "O estudo exegético da poesia hebraica antiga."
      ],
      correct_option_index: 2,
      explanation: "Eisegese ocorre quando o leitor introduz seus próprios pensamentos ou doutrinas no texto bíblico ('ler para dentro'), ao contrário da exegese, que busca retirar o sentido original do próprio texto ('ler para fora')."
    },
    {
      id: "quiz-2",
      lesson_id: "lesson-intro",
      question: "Quais são os três grandes abismos interpretativos que a hermenêutica auxilia a superar?",
      options: [
        "Social, Financeiro e Eclesiástico.",
        "Geográfico, Filosófico e Doutrinário.",
        "Histórico, Cultural e Linguístico.",
        "Linguístico, Psicológico e Comunitário."
      ],
      correct_option_index: 2,
      explanation: "Os três abismos básicos são o Histórico (passagem do tempo), o Cultural (diferença de tradições) e o Linguístico (idiomas originais)."
    }
  ];

  return { seededProfiles, seededCategories, seededCourses, seededModules, seededLessons, seededQuizzes };
};

// Carregar tabelas do localStorage
if (isClient) {
  try {
    const savedProfiles = localStorage.getItem("lms_db_profiles");
    const savedCategories = localStorage.getItem("lms_db_categories");
    const savedCourses = localStorage.getItem("lms_db_courses");
    const savedModules = localStorage.getItem("lms_db_modules");
    const savedLessons = localStorage.getItem("lms_db_lessons");
    const savedQuizzes = localStorage.getItem("lms_db_quizzes");
    const savedProgress = localStorage.getItem("lms_db_progress");
    const savedQuizAnswers = localStorage.getItem("lms_db_quiz_answers");
    const savedUser = localStorage.getItem("lms_auth_user");

    if (savedProfiles && savedCourses) {
      globalProfiles = JSON.parse(savedProfiles);
      globalCategories = JSON.parse(savedCategories || "[]");
      globalCourses = JSON.parse(savedCourses);
      globalModules = JSON.parse(savedModules || "[]");
      globalLessons = JSON.parse(savedLessons || "[]");
      globalQuizzes = JSON.parse(savedQuizzes || "[]");
      globalProgress = JSON.parse(savedProgress || "[]");
      globalQuizAnswers = JSON.parse(savedQuizAnswers || "[]");
    } else {
      const seeds = runDatabaseSeeding();
      globalProfiles = seeds.seededProfiles;
      globalCategories = seeds.seededCategories;
      globalCourses = seeds.seededCourses;
      globalModules = seeds.seededModules;
      globalLessons = seeds.seededLessons;
      globalQuizzes = seeds.seededQuizzes;
      globalProgress = [];
      globalQuizAnswers = [];

      localStorage.setItem("lms_db_profiles", JSON.stringify(globalProfiles));
      localStorage.setItem("lms_db_categories", JSON.stringify(globalCategories));
      localStorage.setItem("lms_db_courses", JSON.stringify(globalCourses));
      localStorage.setItem("lms_db_modules", JSON.stringify(globalModules));
      localStorage.setItem("lms_db_lessons", JSON.stringify(globalLessons));
      localStorage.setItem("lms_db_quizzes", JSON.stringify(globalQuizzes));
      localStorage.setItem("lms_db_progress", JSON.stringify(globalProgress));
      localStorage.setItem("lms_db_quiz_answers", JSON.stringify(globalQuizAnswers));
    }

    if (savedUser) {
      globalCurrentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error("Falha ao inicializar o banco LMS mock", e);
  }
}

// Sincronizar e notificar reativamente
function sync() {
  listeners.forEach((l) => l());
  if (isClient) {
    localStorage.setItem("lms_db_profiles", JSON.stringify(globalProfiles));
    localStorage.setItem("lms_db_categories", JSON.stringify(globalCategories));
    localStorage.setItem("lms_db_courses", JSON.stringify(globalCourses));
    localStorage.setItem("lms_db_modules", JSON.stringify(globalModules));
    localStorage.setItem("lms_db_lessons", JSON.stringify(globalLessons));
    localStorage.setItem("lms_db_quizzes", JSON.stringify(globalQuizzes));
    localStorage.setItem("lms_db_progress", JSON.stringify(globalProgress));
    localStorage.setItem("lms_db_quiz_answers", JSON.stringify(globalQuizAnswers));
    if (globalCurrentUser) {
      localStorage.setItem("lms_auth_user", JSON.stringify(globalCurrentUser));
    } else {
      localStorage.removeItem("lms_auth_user");
    }
  }
}

export function useLmsStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // --- MOCK AUTH ACTIONS ---
  const login = (email: string): { success: boolean; error?: string } => {
    const profile = globalProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (profile) {
      globalCurrentUser = profile;
      sync();
      return { success: true };
    }
    return { success: false, error: "Usuário não encontrado. Cadastre-se ou use os atalhos de teste." };
  };

  const register = (name: string, email: string, role: "student" | "teacher"): { success: boolean; error?: string } => {
    const exists = globalProfiles.some((p) => p.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: "Este e-mail já está sendo utilizado." };
    }

    const newProfile: Profile = {
      id: "profile-" + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role
    };

    globalProfiles = [...globalProfiles, newProfile];
    globalCurrentUser = newProfile;
    sync();
    return { success: true };
  };

  const logout = () => {
    globalCurrentUser = null;
    sync();
  };

  // --- CATEGORY CRUD ---
  const getCategories = () => globalCategories;

  const addCategory = (name: string, description?: string) => {
    const newCat: Category = {
      id: "cat-" + Math.random().toString(36).substring(2, 9),
      name,
      description
    };
    globalCategories = [...globalCategories, newCat];
    sync();
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Omit<Category, "id">>) => {
    globalCategories = globalCategories.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    sync();
  };

  const deleteCategory = (id: string) => {
    globalCategories = globalCategories.filter((c) => c.id !== id);
    sync();
  };

  // --- COURSE CRUD ---
  const getCourses = () => globalCourses;
  const getCourse = (id: string) => globalCourses.find((c) => c.id === id);

  const addCourse = (title: string, description: string, category_id: string) => {
    const newCourse: Course = {
      id: "course-" + Math.random().toString(36).substring(2, 9),
      title,
      description,
      category_id,
      is_published: true
    };
    globalCourses = [...globalCourses, newCourse];
    sync();
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Omit<Course, "id">>) => {
    globalCourses = globalCourses.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    sync();
  };

  const deleteCourse = (id: string) => {
    globalCourses = globalCourses.filter((c) => c.id !== id);
    // Cascade delete modules, lessons, quizzes
    const modulesToDelete = globalModules.filter((m) => m.course_id === id);
    modulesToDelete.forEach((mod) => {
      deleteModule(mod.id);
    });
    sync();
  };

  // --- MODULE CRUD ---
  const getCourseModules = (courseId: string) => {
    return globalModules
      .filter((m) => m.course_id === courseId)
      .sort((a, b) => a.order - b.order);
  };

  const addModule = (courseId: string, title: string) => {
    const siblingCount = globalModules.filter((m) => m.course_id === courseId).length;
    const newMod: Module = {
      id: "mod-" + Math.random().toString(36).substring(2, 9),
      course_id: courseId,
      title,
      order: siblingCount + 1
    };
    globalModules = [...globalModules, newMod];
    sync();
    return newMod;
  };

  const updateModule = (id: string, title: string) => {
    globalModules = globalModules.map((m) =>
      m.id === id ? { ...m, title } : m
    );
    sync();
  };

  const deleteModule = (id: string) => {
    globalModules = globalModules.filter((m) => m.id !== id);
    // Cascade delete lessons
    const lessonsToDelete = globalLessons.filter((l) => l.module_id === id);
    lessonsToDelete.forEach((les) => {
      deleteLesson(les.id);
    });
    sync();
  };

  // --- LESSON CRUD ---
  const getModuleLessons = (moduleId: string) => {
    return globalLessons
      .filter((l) => l.module_id === moduleId)
      .sort((a, b) => a.order - b.order);
  };

  const getLesson = (id: string) => globalLessons.find((l) => l.id === id);

  const addLesson = (moduleId: string, title: string, content: string) => {
    const siblingCount = globalLessons.filter((l) => l.module_id === moduleId).length;
    const newLesson: Lesson = {
      id: "lesson-" + Math.random().toString(36).substring(2, 9),
      module_id: moduleId,
      title,
      content,
      order: siblingCount + 1
    };
    globalLessons = [...globalLessons, newLesson];
    sync();
    return newLesson;
  };

  const updateLesson = (id: string, updates: Partial<Omit<Lesson, "id" | "module_id">>) => {
    globalLessons = globalLessons.map((l) =>
      l.id === id ? { ...l, ...updates } : l
    );
    sync();
  };

  const deleteLesson = (id: string) => {
    globalLessons = globalLessons.filter((l) => l.id !== id);
    // Cascade delete quizzes and progress
    globalQuizzes = globalQuizzes.filter((q) => q.lesson_id !== id);
    globalProgress = globalProgress.filter((p) => p.lesson_id !== id);
    sync();
  };

  // --- QUIZ CRUD ---
  const getLessonQuizzes = (lessonId: string) => {
    return globalQuizzes.filter((q) => q.lesson_id === lessonId);
  };

  const addQuiz = (lessonId: string, question: string, options: string[], correctIndex: number, explanation?: string) => {
    const newQuiz: Quiz = {
      id: "quiz-" + Math.random().toString(36).substring(2, 9),
      lesson_id: lessonId,
      question,
      options,
      correct_option_index: correctIndex,
      explanation
    };
    globalQuizzes = [...globalQuizzes, newQuiz];
    sync();
    return newQuiz;
  };

  const updateQuiz = (id: string, updates: Partial<Omit<Quiz, "id" | "lesson_id">>) => {
    globalQuizzes = globalQuizzes.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    );
    sync();
  };

  const deleteQuiz = (id: string) => {
    globalQuizzes = globalQuizzes.filter((q) => q.id !== id);
    globalQuizAnswers = globalQuizAnswers.filter((a) => a.quiz_id !== id);
    sync();
  };

  // --- STUDENT PROGRESS MANAGEMENT ---
  const getLessonProgress = (userId: string, lessonId: string) => {
    return globalProgress.find((p) => p.user_id === userId && p.lesson_id === lessonId);
  };

  const toggleLessonProgress = (userId: string, lessonId: string) => {
    const existingIndex = globalProgress.findIndex((p) => p.user_id === userId && p.lesson_id === lessonId);
    
    if (existingIndex > -1) {
      const updatedProgress = [...globalProgress];
      updatedProgress[existingIndex] = {
        ...updatedProgress[existingIndex],
        is_completed: !updatedProgress[existingIndex].is_completed
      };
      globalProgress = updatedProgress;
    } else {
      globalProgress = [
        ...globalProgress,
        {
          id: "progress-" + Math.random().toString(36).substring(2, 9),
          user_id: userId,
          lesson_id: lessonId,
          is_completed: true
        }
      ];
    }
    sync();
  };

  // Calcular progresso do curso em porcentagem (0 - 100)
  const getCourseProgressPercent = (userId: string, courseId: string) => {
    const modules = globalModules.filter((m) => m.course_id === courseId);
    const moduleIds = modules.map((m) => m.id);
    const lessons = globalLessons.filter((l) => moduleIds.includes(l.module_id));
    
    if (lessons.length === 0) return 0;

    const lessonIds = lessons.map((l) => l.id);
    const completedCount = globalProgress.filter(
      (p) => p.user_id === userId && lessonIds.includes(p.lesson_id) && p.is_completed
    ).length;

    return Math.round((completedCount / lessons.length) * 100);
  };

  // --- QUIZ ANSWERS LOGGER ---
  const getQuizAnswer = (userId: string, quizId: string) => {
    return globalQuizAnswers.find((a) => a.user_id === userId && a.quiz_id === quizId);
  };

  const submitQuizAnswer = (userId: string, quizId: string, selectedOptionIndex: number, isCorrect: boolean) => {
    const existingIndex = globalQuizAnswers.findIndex((a) => a.user_id === userId && a.quiz_id === quizId);

    const newAnswer: QuizAnswer = {
      id: "ans-" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      quiz_id: quizId,
      selected_option_index: selectedOptionIndex,
      is_correct: isCorrect
    };

    if (existingIndex > -1) {
      const updatedAnswers = [...globalQuizAnswers];
      updatedAnswers[existingIndex] = newAnswer;
      globalQuizAnswers = updatedAnswers;
    } else {
      globalQuizAnswers = [...globalQuizAnswers, newAnswer];
    }
    sync();
    return newAnswer;
  };

  // Método auxiliar para carregar a ementa completa (FullCourse)
  const getFullCourse = (courseId: string): (Course & { modules: (Module & { lessons: (Lesson & { quizzes: Quiz[] })[] })[] }) | null => {
    const course = getCourse(courseId);
    if (!course) return null;

    const modules = getCourseModules(courseId).map((mod) => {
      const lessons = getModuleLessons(mod.id).map((les) => {
        const quizzes = getLessonQuizzes(les.id);
        return { ...les, quizzes };
      });
      return { ...mod, lessons };
    });

    return { ...course, modules };
  };

  // Lineariza lições de um curso completo
  const getCourseFlatLessons = (courseId: string) => {
    const modules = getCourseModules(courseId);
    return modules.flatMap((m) =>
      getModuleLessons(m.id).map((l) => ({ moduleId: m.id, moduleTitle: m.title, lesson: l }))
    );
  };

  // Encontra a lição, e o curso relacionado, bem como anterior e próxima
  const findRelationalLesson = (lessonId: string) => {
    const lesson = getLesson(lessonId);
    if (!lesson) return null;

    const module = globalModules.find((m) => m.id === lesson.module_id);
    if (!module) return null;

    const course = getCourse(module.course_id);
    if (!course) return null;

    const flat = getCourseFlatLessons(course.id);
    const idx = flat.findIndex((f) => f.lesson.id === lessonId);
    if (idx === -1) return null;

    return {
      course,
      module,
      lesson,
      entry: flat[idx],
      prev: idx > 0 ? flat[idx - 1] : null,
      next: idx < flat.length - 1 ? flat[idx + 1] : null
    };
  };

  return {
    currentUser: globalCurrentUser,
    profiles: globalProfiles,
    categories: globalCategories,
    courses: globalCourses,
    modules: globalModules,
    lessons: globalLessons,
    quizzes: globalQuizzes,
    progress: globalProgress,
    quizAnswers: globalQuizAnswers,
    login,
    register,
    logout,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourseModules,
    addModule,
    updateModule,
    deleteModule,
    getModuleLessons,
    getLesson,
    addLesson,
    updateLesson,
    deleteLesson,
    getLessonQuizzes,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    getLessonProgress,
    toggleLessonProgress,
    getCourseProgressPercent,
    getQuizAnswer,
    submitQuizAnswer,
    getFullCourse,
    getCourseFlatLessons,
    findRelationalLesson
  };
}
