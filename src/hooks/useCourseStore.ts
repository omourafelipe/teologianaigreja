import { useState, useEffect } from "react";
import { courses as defaultCourses } from "@/data/mockData";

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  teacherPlan?: string;
  quiz?: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string; // Nome da categoria
  modules: Module[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

// Categorias iniciais padrão
const defaultCategories: Category[] = [
  { id: "cat-biblia", name: "Bíblia", description: "Estudos textuais e exegéticos das Escrituras" },
  { id: "cat-teologia", name: "Teologia", description: "Teologia sistemática, bíblica e histórica" },
  { id: "cat-estudos", name: "Teologia e Estudo", description: "Cursos práticos e estudos bíblicos gerais" }
];

let globalCourses: Course[] = [];
let globalCategories: Category[] = [];
const listeners = new Set<() => void>();

const isClient = typeof window !== "undefined";

const seedInitialData = () => {
  const seeded = [...defaultCourses];
  // Seed the first lesson of the hermeneutica-1 course with a teacher plan and a quiz
  const hermeneuticaCourse = seeded.find(c => c.id === "curso-hermeneutica-1");
  if (hermeneuticaCourse && hermeneuticaCourse.modules[0] && hermeneuticaCourse.modules[0].lessons[0]) {
    hermeneuticaCourse.modules[0].lessons[0].teacherPlan = `# Guia do Professor: Introdução à Hermenêutica
    
> "O objetivo deste roteiro é ajudar a liderar a classe através de um debate prático sobre a interpretação bíblica."

## Objetivos da Aula
1. Compreender a diferença entre tradução, interpretação e aplicação.
2. Identificar os três grandes abismos (histórico, cultural e linguístico) na leitura da Bíblia.
3. Estimular a leitura atenta a fim de evitar a *eisegese* (colocar ideias próprias no texto).

## Dinâmica Quebra-Gelo: "O Jogo das Traduções" (10 minutos)
*   Selecione três alunos e peça para eles reescreverem uma mensagem simples em outros estilos (gírias de internet, linguagem formal antiga e estilo jornalístico).
*   Peça para lerem em voz alta e mostre como a mudança de estilo linguístico altera a percepção do conteúdo. Introduza com isso o **abismo linguístico** e a importância da hermenêutica.

## Roteiro de Perguntas para Discussão em Classe
1. **Discussão:** Se toda leitura já é um processo de tradução mental, como podemos manter a humildade e a objetividade ao ler passagens bíblicas difíceis?
2. **Exemplo Prático:** Discuta a passagem de *Mateus 19:24* ("É mais fácil um camelo passar pelo fundo de uma agulha..."). Como a pesquisa histórica sobre os costumes da época e possíveis portões de Jerusalém ajudam a compreender esta figura de linguagem?
`;

    hermeneuticaCourse.modules[0].lessons[0].quiz = [
      {
        id: "q-1",
        questionText: "O que significa o termo hermenêutica, de origem grega?",
        options: [
          "Apenas a cópia manual de documentos sagrados.",
          "A ciência e arte de interpretar as Escrituras.",
          "O estudo da história geográfica de Israel.",
          "A pregação pública e exortação."
        ],
        correctOptionIndex: 1,
        explanation: "Hermenêutica deriva do grego 'hermeneuein', que se refere a interpretar, explicar ou traduzir. É uma ciência por ter regras claras e uma arte por requerer sensibilidade literária e espiritual."
      },
      {
        id: "q-2",
        questionText: "Quais são os três grandes abismos que a hermenêutica nos ajuda a superar?",
        options: [
          "Doutrinário, Denominacional e Político.",
          "Histórico, Cultural e Linguístico.",
          "Linguístico, Filosófico e Geográfico.",
          "Social, Psicológico e Acadêmico."
        ],
        correctOptionIndex: 1,
        explanation: "Os três abismos básicos são o Histórico (tempo de distância), Cultural (diferenças de costumes de civilizações antigas) e Linguístico (hebraico/aramaico/grego antigos em comparação aos idiomas modernos)."
      }
    ];
  }
  return seeded;
};

// Inicializar estado a partir do localStorage ou mockData
if (isClient) {
  try {
    const savedCourses = localStorage.getItem("ebd_courses");
    if (savedCourses) {
      globalCourses = JSON.parse(savedCourses);
    } else {
      globalCourses = seedInitialData();
      localStorage.setItem("ebd_courses", JSON.stringify(globalCourses));
    }
  } catch (e) {
    globalCourses = seedInitialData();
  }


  try {
    const savedCategories = localStorage.getItem("ebd_categories");
    if (savedCategories) {
      globalCategories = JSON.parse(savedCategories);
    } else {
      globalCategories = defaultCategories;
      localStorage.setItem("ebd_categories", JSON.stringify(globalCategories));
    }
  } catch (e) {
    globalCategories = defaultCategories;
  }
} else {
  globalCourses = defaultCourses;
  globalCategories = defaultCategories;
}

function notify() {
  listeners.forEach((l) => l());
  if (isClient) {
    localStorage.setItem("ebd_courses", JSON.stringify(globalCourses));
    localStorage.setItem("ebd_categories", JSON.stringify(globalCategories));
  }
}

export function useCourseStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Operações de Curso
  const getCourses = () => globalCourses;
  const getCourse = (id: string) => globalCourses.find((c) => c.id === id);

  const addCourse = (course: Omit<Course, "id" | "modules">) => {
    const newCourse: Course = {
      ...course,
      id: "course-" + Math.random().toString(36).substring(2, 9),
      modules: []
    };
    globalCourses = [...globalCourses, newCourse];
    notify();
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Omit<Course, "id" | "modules">>) => {
    globalCourses = globalCourses.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    notify();
  };

  const deleteCourse = (id: string) => {
    globalCourses = globalCourses.filter((c) => c.id !== id);
    notify();
  };

  // Operações de Categoria
  const getCategories = () => globalCategories;
  
  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: "category-" + Math.random().toString(36).substring(2, 9)
    };
    globalCategories = [...globalCategories, newCategory];
    notify();
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Omit<Category, "id">>) => {
    globalCategories = globalCategories.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    notify();
  };

  const deleteCategory = (id: string) => {
    globalCategories = globalCategories.filter((c) => c.id !== id);
    notify();
  };

  // Operações de Módulo
  const addModule = (courseId: string, title: string) => {
    const newModule: Module = {
      id: "mod-" + Math.random().toString(36).substring(2, 9),
      title,
      lessons: []
    };
    globalCourses = globalCourses.map((c) => {
      if (c.id === courseId) {
        return { ...c, modules: [...c.modules, newModule] };
      }
      return c;
    });
    notify();
    return newModule;
  };

  const updateModule = (courseId: string, moduleId: string, title: string) => {
    globalCourses = globalCourses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map((m) => (m.id === moduleId ? { ...m, title } : m))
        };
      }
      return c;
    });
    notify();
  };

  const deleteModule = (courseId: string, moduleId: string) => {
    globalCourses = globalCourses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.filter((m) => m.id !== moduleId)
        };
      }
      return c;
    });
    notify();
  };

  // Operações de Lição
  const addLesson = (
    courseId: string,
    moduleId: string,
    title: string,
    content: string,
    teacherPlan?: string,
    quiz?: QuizQuestion[]
  ) => {
    const newLesson: Lesson = {
      id: "lesson-" + Math.random().toString(36).substring(2, 9),
      title,
      content,
      teacherPlan,
      quiz
    };
    globalCourses = globalCourses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id === moduleId) {
              return { ...m, lessons: [...m.lessons, newLesson] };
            }
            return m;
          })
        };
      }
      return c;
    });
    notify();
    return newLesson;
  };

  const updateLesson = (courseId: string, moduleId: string, lessonId: string, updates: Partial<Omit<Lesson, "id">>) => {
    globalCourses = globalCourses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id === moduleId) {
              return {
                ...m,
                lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l))
              };
            }
            return m;
          })
        };
      }
      return c;
    });
    notify();
  };

  const deleteLesson = (courseId: string, moduleId: string, lessonId: string) => {
    globalCourses = globalCourses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id === moduleId) {
              return {
                ...m,
                lessons: m.lessons.filter((l) => l.id !== lessonId)
              };
            }
            return m;
          })
        };
      }
      return c;
    });
    notify();
  };

  // Helper para linearizar as lições (essencial para anterior/próxima lição)
  const getFlatLessons = (course: Course) => {
    return course.modules.flatMap((m) =>
      m.lessons.map((l) => ({ moduleId: m.id, moduleTitle: m.title, lesson: l }))
    );
  };

  const findLesson = (courseId: string, lessonId: string) => {
    const course = getCourse(courseId);
    if (!course) return null;
    const flat = getFlatLessons(course);
    const idx = flat.findIndex((f) => f.lesson.id === lessonId);
    if (idx === -1) return null;
    return {
      course,
      entry: flat[idx],
      prev: idx > 0 ? flat[idx - 1] : null,
      next: idx < flat.length - 1 ? flat[idx + 1] : null
    };
  };

  return {
    courses: globalCourses,
    categories: globalCategories,
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    getFlatLessons,
    findLesson
  };
}
