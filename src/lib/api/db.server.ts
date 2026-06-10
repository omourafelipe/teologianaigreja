import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase, isSupabaseConfigured } from "../supabase.server";
import { Category, Course, Module, Lesson, Quiz } from "@/types/database.types";

// --- BANCO DE DADOS SEMENTE EM MEMÓRIA (FALLBACK SERVER-SIDE) ---
let memoryCategories: Category[] = [
  { id: "cat-biblia", name: "Estudo Bíblico", description: "Cursos de interpretação, exegese e panorama bíblico." },
  { id: "cat-teologia", name: "Teologia Sistemática", description: "Grandes doutrinas e tópicos sistemáticos." }
];

let memoryCourses: Course[] = [
  {
    id: "course-hermeneutica",
    title: "Fundamentos da Hermenêutica Bíblica",
    description: "Aprenda os princípios fundamentais para interpretar as Escrituras com fidelidade, considerando abismos históricos, culturais e linguísticos.",
    category_id: "cat-biblia",
    is_published: true
  }
];

let memoryModules: Module[] = [
  { id: "mod-1", course_id: "course-hermeneutica", title: "Módulo 1: O que é Interpretação?", order: 1 },
  { id: "mod-2", course_id: "course-hermeneutica", title: "Módulo 2: O Contexto e a História", order: 2 }
];

let memoryLessons: Lesson[] = [
  {
    id: "lesson-intro",
    module_id: "mod-1",
    title: "Introdução: A Necessidade da Hermenêutica",
    content: `# Introdução à Hermenêutica\n\nA **hermenêutica bíblica** é a ciência e a arte de interpretar as Escrituras Sagradas. O termo deriva do grego *hermeneuein*, que significa "explicar", "interpretar" ou "traduzir".\n\n## Por que a interpretação é necessária?\n\nMuitas pessoas afirmam: *"Eu não preciso interpretar a Bíblia, eu apenas a leio e aceito o que ela diz"*. Embora essa seja uma atitude piedosa, ela ignora uma realidade fundamental: **todo leitor é um intérprete**.\n\nQuando lemos um texto antigo, automaticamente passamos as palavras pelo filtro da nossa cultura, idioma e experiências. A hermenêutica nos ajuda a superar três grandes abismos:\n\n1. **O Abismo Histórico:** Estamos separados dos eventos bíblicos por milhares de anos. A forma como o mundo funcionava era drasticamente diferente.\n2. **O Abismo Cultural:** Os costumes, as tradições e a visão de mundo dos hebreus antigos ou dos cristãos do primeiro século em Israel, Grécia ou Roma não são os mesmos do leitor moderno.\n3. **O Abismo Linguístico:** A Bíblia foi escrita em Hebraico, Aramaico e Grego. Toda tradução já é, em si mesma, uma forma de interpretação.\n\n## Os Três Passos Básicos do Estudo Bíblico\n\nPara garantir uma leitura saudável na Escola Bíblica, recomendamos o método indutivo, que se divide em três etapas fundamentais:\n\n*   **Observação:** O que o texto diz? (Identificar personagens, verbos, repetições).\n*   **Interpretação:** O que o texto significava para os leitores originais?\n*   **Aplicação:** Como esse princípio eterno se aplica à minha vida hoje?\n\nCom essas ferramentas em mãos, o texto sagrado se abre com muito mais clareza, evitando que coloquemos nossas próprias ideias na boca de Deus (o que chamamos de *eisegese*).`,
    order: 1
  },
  {
    id: "lesson-contexto",
    module_id: "mod-2",
    title: "O Contexto Literário e Histórico",
    content: `# O Contexto Literário e Histórico\n\nNa interpretação de qualquer texto, uma regra se destaca acima de quase todas as outras: **o contexto é rei**.\n\n## O Perigo de Textos Fora do Contexto\n\nA famosa frase *"um texto fora de contexto vira um pretexto para uma heresia"* resume um dos erros mais comuns na leitura das Escrituras.\n\nQuando isolamos um versículo de seu parágrafo, capítulo ou livro, podemos fazê-lo dizer praticamente qualquer coisa que desejarmos.\n\n### O Contexto Literário\nRefere-se ao texto que cerca a passagem que você está estudando. Para compreender um versículo:\n1. Leia a frase completa.\n2. Leia o parágrafo inteiro.\n3. Compreenda o capítulo.\n4. Identifique o gênero literário (Poesia, Lei, Epístola, Profecia, Narrativa).\n\n### O Contexto Histórico-Cultural\nRefere-se ao mundo do autor e dos leitores originais:\n* Quem escreveu?\n* Para quem foi escrito?\n* Qual era a situação social, política ou geográfica da época?\n* O que as palavras significavam naquele ambiente cultural específico?`,
    order: 1
  }
];

let memoryQuizzes: Quiz[] = [
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

// --- SERVER-SIDE DATA ACTIONS (GET ALL) ---

export const getFullDatabaseData = createServerFn({ method: "GET" })
  .handler(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const [cats, crs, mods, less, qzs] = await Promise.all([
          supabase.from("categories").select("*"),
          supabase.from("courses").select("*"),
          supabase.from("modules").select("*"),
          supabase.from("lessons").select("*"),
          supabase.from("quizzes").select("*")
        ]);

        if (cats.error) throw cats.error;
        if (crs.error) throw crs.error;
        if (mods.error) throw mods.error;
        if (less.error) throw less.error;
        if (qzs.error) throw qzs.error;

        return {
          categories: (cats.data || []) as Category[],
          courses: (crs.data || []) as Course[],
          modules: (mods.data || []) as Module[],
          lessons: (less.data || []) as Lesson[],
          quizzes: (qzs.data || []) as Quiz[]
        };
      } catch (e) {
        console.error("Erro ao carregar do Supabase, revertendo para dados semente:", e);
      }
    }

    // Fallback para memória local do servidor
    return {
      categories: memoryCategories,
      courses: memoryCourses,
      modules: memoryModules,
      lessons: memoryLessons,
      quizzes: memoryQuizzes
    };
  });

// --- MUTATORS: CATEGORIES ---

export const addCategoryServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), name: z.string(), description: z.string().optional() }))
  .handler(async ({ data }) => {
    const newCat: Category = { id: data.id, name: data.name, description: data.description };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("categories").insert(newCat);
      if (error) throw new Error(error.message);
      return newCat;
    }

    memoryCategories.push(newCat);
    return newCat;
  });

export const updateCategoryServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), name: z.string(), description: z.string().optional() }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("categories")
        .update({ name: data.name, description: data.description })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    memoryCategories = memoryCategories.map(c =>
      c.id === data.id ? { ...c, name: data.name, description: data.description } : c
    );
  });

export const deleteCategoryServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("categories").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    memoryCategories = memoryCategories.filter(c => c.id !== data.id);
  });

// --- MUTATORS: COURSES ---

export const addCourseServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category_id: z.string()
  }))
  .handler(async ({ data }) => {
    const newCourse: Course = {
      id: data.id,
      title: data.title,
      description: data.description,
      category_id: data.category_id,
      is_published: true
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("courses").insert(newCourse);
      if (error) throw new Error(error.message);
      return newCourse;
    }

    memoryCourses.push(newCourse);
    return newCourse;
  });

export const updateCourseServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category_id: z.string(),
    is_published: z.boolean()
  }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("courses")
        .update({
          title: data.title,
          description: data.description,
          category_id: data.category_id,
          is_published: data.is_published
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    memoryCourses = memoryCourses.map(c =>
      c.id === data.id ? {
        ...c,
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        is_published: data.is_published
      } : c
    );
  });

export const deleteCourseServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("courses").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    // Cascade deletes em memória local
    const modulesToDelete = memoryModules.filter(m => m.course_id === data.id);
    const modIds = modulesToDelete.map(m => m.id);
    const lessonsToDelete = memoryLessons.filter(l => modIds.includes(l.module_id));
    const lesIds = lessonsToDelete.map(l => l.id);

    memoryCourses = memoryCourses.filter(c => c.id !== data.id);
    memoryModules = memoryModules.filter(m => m.course_id !== data.id);
    memoryLessons = memoryLessons.filter(l => !modIds.includes(l.module_id));
    memoryQuizzes = memoryQuizzes.filter(q => !lesIds.includes(q.lesson_id));
  });

// --- MUTATORS: MODULES ---

export const addModuleServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string(),
    course_id: z.string(),
    title: z.string(),
    order: z.number()
  }))
  .handler(async ({ data }) => {
    const newMod: Module = {
      id: data.id,
      course_id: data.course_id,
      title: data.title,
      order: data.order
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("modules").insert(newMod);
      if (error) throw new Error(error.message);
      return newMod;
    }

    memoryModules.push(newMod);
    return newMod;
  });

export const updateModuleServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string(),
    title: z.string()
  }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("modules").update({ title: data.title }).eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    memoryModules = memoryModules.map(m => m.id === data.id ? { ...m, title: data.title } : m);
  });

export const deleteModuleServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("modules").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    const lessonsToDelete = memoryLessons.filter(l => l.module_id === data.id);
    const lesIds = lessonsToDelete.map(l => l.id);

    memoryModules = memoryModules.filter(m => m.id !== data.id);
    memoryLessons = memoryLessons.filter(l => l.module_id !== data.id);
    memoryQuizzes = memoryQuizzes.filter(q => !lesIds.includes(q.lesson_id));
  });

// --- MUTATORS: LESSONS ---

export const addLessonServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string(),
    module_id: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number()
  }))
  .handler(async ({ data }) => {
    const newLesson: Lesson = {
      id: data.id,
      module_id: data.module_id,
      title: data.title,
      content: data.content,
      order: data.order
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("lessons").insert(newLesson);
      if (error) throw new Error(error.message);
      return newLesson;
    }

    memoryLessons.push(newLesson);
    return newLesson;
  });

export const updateLessonServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string()
  }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("lessons")
        .update({ title: data.title, content: data.content })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    memoryLessons = memoryLessons.map(l =>
      l.id === data.id ? { ...l, title: data.title, content: data.content } : l
    );
  });

export const deleteLessonServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("lessons").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    memoryLessons = memoryLessons.filter(l => l.id !== data.id);
    memoryQuizzes = memoryQuizzes.filter(q => q.lesson_id !== data.id);
  });

// --- MUTATORS: QUIZZES ---

export const addQuizServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string(),
    lesson_id: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correct_option_index: z.number(),
    explanation: z.string().optional()
  }))
  .handler(async ({ data }) => {
    const newQuiz: Quiz = {
      id: data.id,
      lesson_id: data.lesson_id,
      question: data.question,
      options: data.options,
      correct_option_index: data.correct_option_index,
      explanation: data.explanation
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("quizzes").insert(newQuiz);
      if (error) throw new Error(error.message);
      return newQuiz;
    }

    memoryQuizzes.push(newQuiz);
    return newQuiz;
  });

export const updateQuizServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correct_option_index: z.number(),
    explanation: z.string().optional()
  }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("quizzes")
        .update({
          question: data.question,
          options: data.options,
          correct_option_index: data.correct_option_index,
          explanation: data.explanation
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    memoryQuizzes = memoryQuizzes.map(q =>
      q.id === data.id ? {
        ...q,
        question: data.question,
        options: data.options,
        correct_option_index: data.correct_option_index,
        explanation: data.explanation
      } : q
    );
  });

export const deleteQuizServer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("quizzes").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return;
    }

    memoryQuizzes = memoryQuizzes.filter(q => q.id !== data.id);
  });
