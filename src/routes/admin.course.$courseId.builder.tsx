import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Check,
  X,
  FileText,
  Eye,
  Columns,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link2,
  List as ListIcon,
  Tag,
  Sparkles,
  Play,
  Headphones,
  FileDown,
  Copy,
} from "lucide-react";
import { useLmsStore } from "@/hooks/useLmsStore";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Quiz } from "@/types/database.types";

export const Route = createFileRoute("/admin/course/$courseId/builder")({
  component: CourseBuilderPage,
});

function CourseBuilderPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const {
    getFullCourse,
    updateCourse,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    duplicateCourse,
    categories,
  } = useLmsStore();

  const course = getFullCourse(courseId);

  // States for course metadata editing
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCatId, setCourseCatId] = useState("");

  // States for Modules
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");

  // States for Lesson Editor Overlay
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string>("");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null); // null if new lesson
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [activeEditorTab, setActiveEditorTab] = useState<"content" | "quiz">("content");
  const [editorMode, setEditorMode] = useState<"edit" | "preview" | "split">("split");

  // Local state for quizzes when creating a new lesson (or viewing/editing for existing lesson)
  const [localQuizzes, setLocalQuizzes] = useState<Omit<Quiz, "id" | "lesson_id">[]>([]);
  const [quizQuestionText, setQuizQuestionText] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState("");
  const [editingQuizIndex, setEditingQuizIndex] = useState<number | null>(null); // index in localQuizzes

  // Initialize course state
  useEffect(() => {
    if (course) {
      setCourseTitle(course.title);
      setCourseDesc(course.description);
      setCourseCatId(course.category_id);
    }
  }, [course?.id]);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold">Curso não encontrado</h1>
        <Link
          to="/admin/courses"
          className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400"
        >
          ← Voltar aos cursos
        </Link>
      </div>
    );
  }

  const categoryName =
    categories.find((cat) => cat.id === course.category_id)?.name || "Sem Categoria";

  // Course Meta Handlers
  const handleSaveMeta = () => {
    if (!courseTitle.trim() || !courseCatId) return;
    updateCourse(course.id, {
      title: courseTitle.trim(),
      description: courseDesc.trim(),
      category_id: courseCatId,
    });
    setIsEditingMeta(false);
  };

  // Module Handlers
  const handleAddModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    addModule(course.id, newModuleTitle.trim());
    setNewModuleTitle("");
    setIsAddingModule(false);
  };

  const handleStartEditModule = (id: string, title: string) => {
    setEditingModuleId(id);
    setEditModuleTitle(title);
  };

  const handleSaveModule = (id: string) => {
    if (!editModuleTitle.trim()) return;
    updateModule(id, editModuleTitle.trim());
    setEditingModuleId(null);
  };

  const handleDeleteModule = (id: string, title: string) => {
    if (
      confirm(
        `Tem certeza que deseja excluir o módulo "${title}"? Todas as lições e exercícios deste módulo serão apagados.`,
      )
    ) {
      deleteModule(id);
    }
  };

  // Lesson Editor Handlers
  const handleOpenNewLessonEditor = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(null);
    setLessonTitle("");
    setLessonContent("");
    setLocalQuizzes([]);
    // Reset quiz inputs
    setQuizQuestionText("");
    setQuizOptions(["", "", "", ""]);
    setQuizCorrectIndex(0);
    setQuizExplanation("");
    setEditingQuizIndex(null);

    setActiveEditorTab("content");
    setIsEditingLesson(true);
  };

  const handleOpenEditLessonEditor = (moduleId: string, lesson: any) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content);

    // Set quizzes
    const quizzes = lesson.quizzes || [];
    setLocalQuizzes(
      quizzes.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_option_index: q.correct_option_index,
        explanation: q.explanation || "",
      })),
    );

    // Reset quiz inputs
    setQuizQuestionText("");
    setQuizOptions(["", "", "", ""]);
    setQuizCorrectIndex(0);
    setQuizExplanation("");
    setEditingQuizIndex(null);

    setActiveEditorTab("content");
    setIsEditingLesson(true);
  };

  const handleSaveLesson = () => {
    if (!lessonTitle.trim()) {
      alert("Por favor, digite o título da lição.");
      return;
    }

    if (activeLessonId === null) {
      // Create New Lesson
      const newLes = addLesson(activeModuleId, lessonTitle.trim(), lessonContent);

      // Save Quizzes associated with this new lesson
      localQuizzes.forEach((q) => {
        addQuiz(newLes.id, q.question, q.options, q.correct_option_index, q.explanation);
      });
    } else {
      // Update Existing Lesson
      updateLesson(activeLessonId, {
        title: lessonTitle.trim(),
        content: lessonContent,
      });

      // Synchronize Quizzes: Since quizzes might be added, deleted or modified, we'll reconcile
      const existingQuizzes =
        course.modules.flatMap((m) => m.lessons).find((l) => l.id === activeLessonId)?.quizzes ||
        [];

      // 1. Delete quizzes that are no longer in localQuizzes
      const localQuizIds = localQuizzes.map((q) => (q as any).id).filter(Boolean);
      existingQuizzes.forEach((eq) => {
        if (!localQuizIds.includes(eq.id)) {
          deleteQuiz(eq.id);
        }
      });

      // 2. Add or Update remaining quizzes
      localQuizzes.forEach((q) => {
        const quizId = (q as any).id;
        if (quizId) {
          // Update
          updateQuiz(quizId, {
            question: q.question,
            options: q.options,
            correct_option_index: q.correct_option_index,
            explanation: q.explanation,
          });
        } else {
          // Add new
          addQuiz(activeLessonId, q.question, q.options, q.correct_option_index, q.explanation);
        }
      });
    }

    setIsEditingLesson(false);
    setActiveLessonId(null);
  };

  const handleDeleteLesson = (lessonId: string, title: string) => {
    if (confirm(`Deseja excluir a lição "${title}"?`)) {
      deleteLesson(lessonId);
    }
  };

  const handleAiGenerateQuiz = () => {
    let question =
      "Com base no texto da lição, qual das seguintes alternativas define a exegese teológica?";
    let options = [
      "A extração fiel do significado pretendido pelo autor original.",
      "A inserção de preconceitos modernos no texto bíblico.",
      "O estudo exclusivo da arqueologia na Mesopotâmia.",
      "A tradução sistemática de epístolas paulinas apenas.",
    ];
    let explanation =
      "A exegese consiste em retirar do texto bíblico a sua mensagem original, analisando os contextos históricos, gramaticais e literários.";

    const lower = lessonContent.toLowerCase();
    if (lower.includes("abismo") || lower.includes("cultural")) {
      question = "Qual o significado de abismo cultural na hermenêutica bíblica?";
      options = [
        "A barreira de costumes e tradições entre a época bíblica e a do leitor atual.",
        "A distância em quilômetros do Egito até a Terra Prometida.",
        "A diferença entre os idiomas grego antigo e aramaico bíblico.",
        "O estudo arqueológico da arquitetura de templos romanos.",
      ];
      explanation =
        "O abismo cultural representa as diferenças de cultura, visão de mundo e hábitos entre os escritores bíblicos originais e nós hoje.";
    } else if (lower.includes("contexto") || lower.includes("pretexto")) {
      question = "De acordo com as regras de hermenêutica literária, por que o contexto é rei?";
      options = [
        "Porque ler versículos isoladamente pode gerar distorções e pretexto para heresias.",
        "Porque o rei de Israel determinava quais livros seriam canônicos.",
        "Porque cada capítulo representa um reinado histórico diferente na Bíblia.",
        "Geografia dos montes bíblicos.",
      ];
      explanation =
        "Isolar passagens cria doutrinas falsas. A boa hermenêutica sempre avalia o contexto literário (parágrafos, capítulos, livro inteiro).";
    }

    const aiGeneratedQuiz = {
      question,
      options,
      correct_option_index: 0,
      explanation,
    };

    setLocalQuizzes((prev) => [...prev, aiGeneratedQuiz]);
  };

  // Quiz Handlers inside Lesson Editor
  const handleSaveQuizQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestionText.trim()) return;
    if (quizOptions.some((opt) => !opt.trim())) {
      alert("Por favor, preencha todas as 4 alternativas.");
      return;
    }

    const quizData = {
      question: quizQuestionText.trim(),
      options: quizOptions.map((o) => o.trim()),
      correct_option_index: quizCorrectIndex,
      explanation: quizExplanation.trim(),
    };

    if (editingQuizIndex === null) {
      // Add new local quiz
      setLocalQuizzes((prev) => [...prev, quizData]);
    } else {
      // Edit existing local quiz
      setLocalQuizzes((prev) => {
        const updated = [...prev];
        updated[editingQuizIndex] = {
          ...(updated[editingQuizIndex] as any), // keep id if exists
          ...quizData,
        };
        return updated;
      });
      setEditingQuizIndex(null);
    }

    // Clear inputs
    setQuizQuestionText("");
    setQuizOptions(["", "", "", ""]);
    setQuizCorrectIndex(0);
    setQuizExplanation("");
  };

  const handleEditQuizQuestion = (q: Omit<Quiz, "id" | "lesson_id">, index: number) => {
    setEditingQuizIndex(index);
    setQuizQuestionText(q.question);
    setQuizOptions([...q.options]);
    setQuizCorrectIndex(q.correct_option_index);
    setQuizExplanation(q.explanation || "");
  };

  const handleDeleteQuizQuestion = (index: number) => {
    setLocalQuizzes((prev) => prev.filter((_, idx) => idx !== index));
    if (editingQuizIndex === index) {
      setEditingQuizIndex(null);
      setQuizQuestionText("");
      setQuizOptions(["", "", "", ""]);
      setQuizCorrectIndex(0);
      setQuizExplanation("");
    }
  };

  // Markdown Toolbar Insertion
  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById("lesson-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (syntax === "bold") replacement = `**${selectedText || "negrito"}**`;
    else if (syntax === "italic") replacement = `*${selectedText || "itálico"}*`;
    else if (syntax === "h2") replacement = `\n## ${selectedText || "Subtítulo"}\n`;
    else if (syntax === "h3") replacement = `\n### ${selectedText || "Tópico"}\n`;
    else if (syntax === "quote") replacement = `\n> ${selectedText || "Citação importante"}\n`;
    else if (syntax === "code") replacement = `\`${selectedText || "código"}\``;
    else if (syntax === "link") replacement = `[${selectedText || "link"}](https://exemplo.com)`;
    else if (syntax === "list") replacement = `\n- Item 1\n- Item 2\n`;
    else if (syntax === "video")
      replacement = `\n[video](https://www.w3schools.com/html/mov_bbb.mp4)\n`;
    else if (syntax === "audio")
      replacement = `\n[audio](https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3)\n`;
    else if (syntax === "pdf")
      replacement = `\n[pdf](https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf)\n`;
    else if (syntax === "poll")
      replacement = `\n[enquete](Qual abismo interpretativo você acha mais difícil?)\n`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setLessonContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  // RENDER: Lesson Editor Overlay
  if (isEditingLesson) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingLesson(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              title="Voltar sem salvar"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {activeLessonId === null ? "Nova Lição" : "Editando Lição"}
              </span>
              <h2 className="font-serif text-base font-bold text-slate-855 dark:text-slate-50">
                {lessonTitle || "Sem título"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeEditorTab === "content" && (
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={() => setEditorMode("edit")}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    editorMode === "edit"
                      ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  }`}
                >
                  <FileText className="inline h-3.5 w-3.5 mr-1" /> Editar
                </button>
                <button
                  onClick={() => setEditorMode("preview")}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    editorMode === "preview"
                      ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  }`}
                >
                  <Eye className="inline h-3.5 w-3.5 mr-1" /> Visualizar
                </button>
                <button
                  onClick={() => setEditorMode("split")}
                  className={`hidden md:block rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    editorMode === "split"
                      ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  }`}
                >
                  <Columns className="inline h-3.5 w-3.5 mr-1" /> Dividido
                </button>
              </div>
            )}

            <button
              onClick={handleSaveLesson}
              className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
            >
              Salvar Lição
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="bg-white px-5 py-3 border-b border-slate-100 dark:border-slate-850 dark:bg-slate-950">
          <input
            type="text"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="Título da Lição (ex: Lição 1: Fundamentos da Revelação)"
            className="w-full border-b border-slate-200 bg-transparent py-1 text-base font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:text-slate-50 dark:focus:border-blue-400"
          />
        </div>

        {/* Editor Tabs */}
        <div className="flex border-b border-slate-200/60 bg-white px-5 dark:border-slate-800/60 dark:bg-slate-950">
          <button
            onClick={() => setActiveEditorTab("content")}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
              activeEditorTab === "content"
                ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Artigo de Leitura
          </button>
          <button
            onClick={() => setActiveEditorTab("quiz")}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeEditorTab === "quiz"
                ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Exercícios (Quiz)
            {localQuizzes.length > 0 && (
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                {localQuizzes.length}
              </span>
            )}
          </button>
        </div>

        {/* Markdown Toolbar */}
        {activeEditorTab === "content" && (
          <div className="flex flex-wrap gap-1 border-b border-slate-200/60 bg-slate-50/50 px-5 py-1.5 dark:border-slate-800/60 dark:bg-slate-900/30">
            <button
              onClick={() => insertMarkdown("bold")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Negrito"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("italic")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Itálico"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("h2")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Título H2"
            >
              <Heading2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("h3")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Título H3"
            >
              <Heading3 className="h-3.5 w-3.5" />
            </button>
            <div className="w-[1px] bg-slate-200 dark:bg-slate-800 mx-1.5 my-1"></div>
            <button
              onClick={() => insertMarkdown("quote")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Citação"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("code")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Código"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("link")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Link"
            >
              <Link2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("list")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
              title="Lista"
            >
              <ListIcon className="h-3.5 w-3.5" />
            </button>
            <div className="w-[1px] bg-slate-200 dark:bg-slate-800 mx-1.5 my-1"></div>
            <button
              onClick={() => insertMarkdown("video")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition text-blue-900 dark:text-blue-400"
              title="Inserir Bloco de Vídeo"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("audio")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition text-teal-705 dark:text-teal-400"
              title="Inserir Bloco de Áudio"
            >
              <Headphones className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("pdf")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition text-red-500"
              title="Inserir Bloco de PDF"
            >
              <FileDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown("poll")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition text-amber-500"
              title="Inserir Bloco de Enquete"
            >
              <Tag className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 dark:bg-slate-900/30">
          {activeEditorTab === "content" && (
            <div
              className="grid gap-6 h-full min-h-[350px]"
              style={{
                gridTemplateColumns: editorMode === "split" ? "1fr 1fr" : "1fr",
              }}
            >
              {(editorMode === "edit" || editorMode === "split") && (
                <textarea
                  id="lesson-textarea"
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Escreva o artigo de leitura da lição em Markdown..."
                  className="h-full min-h-[300px] w-full resize-none rounded-lg border border-slate-200 bg-white p-4 text-xs font-mono text-slate-805 focus:outline-none dark:border-slate-850 dark:bg-slate-950/40 dark:text-slate-200 focus:ring-1 focus:ring-blue-900/20"
                />
              )}
              {(editorMode === "preview" || editorMode === "split") && (
                <div className="h-full min-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-950/20">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-850 pb-2">
                    Artigo - Visualização
                  </span>
                  <div className="max-w-none">
                    <MarkdownRenderer
                      content={lessonContent || "*Escreva no editor para visualizar...*"}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeEditorTab === "quiz" && (
            <div className="grid gap-6 lg:grid-cols-5 items-start">
              {/* Question Editor Form */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-850">
                  <h3 className="font-serif text-xs font-bold text-slate-800 dark:text-slate-100">
                    {editingQuizIndex === null ? "Adicionar Questão" : "Editar Questão"}
                  </h3>
                  {editingQuizIndex === null && (
                    <button
                      type="button"
                      onClick={handleAiGenerateQuiz}
                      className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 transition animate-pulse"
                      title="Gerar questão inteligente com base no texto da lição"
                    >
                      <Sparkles className="h-3 w-3" /> Gerar com IA
                    </button>
                  )}
                </div>
                <form onSubmit={handleSaveQuizQuestion} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-450 block">
                      Enunciado da Pergunta *
                    </label>
                    <input
                      type="text"
                      value={quizQuestionText}
                      onChange={(e) => setQuizQuestionText(e.target.value)}
                      placeholder="Ex: O que é a hermenêutica?"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-455 block">
                      Alternativas (Selecione a correta) *
                    </label>
                    <div className="space-y-2">
                      {quizOptions.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct-option"
                            checked={quizCorrectIndex === oIdx}
                            onChange={() => setQuizCorrectIndex(oIdx)}
                            className="h-3.5 w-3.5 text-blue-900 focus:ring-blue-900/20 dark:text-blue-400 dark:focus:ring-blue-400/20"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...quizOptions];
                              newOpts[oIdx] = e.target.value;
                              setQuizOptions(newOpts);
                            }}
                            placeholder={`Alternativa ${String.fromCharCode(65 + oIdx)}`}
                            className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-955 dark:text-slate-250"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-450 block">
                      Gabarito Comentado (Explicação)
                    </label>
                    <textarea
                      value={quizExplanation}
                      onChange={(e) => setQuizExplanation(e.target.value)}
                      placeholder="Explique por que esta alternativa é a correta..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-955 dark:text-slate-200"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    {editingQuizIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuizIndex(null);
                          setQuizQuestionText("");
                          setQuizOptions(["", "", "", ""]);
                          setQuizCorrectIndex(0);
                          setQuizExplanation("");
                        }}
                        className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-900 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 transition"
                    >
                      {editingQuizIndex === null ? "Adicionar Questão" : "Salvar Questão"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Questions List */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 lg:col-span-3 space-y-4">
                <h3 className="font-serif text-xs font-bold text-slate-800 dark:text-slate-100">
                  Questões Adicionadas ({localQuizzes.length})
                </h3>

                {localQuizzes.length === 0 ? (
                  <div className="flex h-48 items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg dark:border-slate-800">
                    Nenhuma questão configurada para esta lição.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {localQuizzes.map((q, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-100 p-4 dark:border-slate-850 dark:bg-slate-950/20 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-xs font-semibold text-slate-850 dark:text-slate-205 leading-relaxed">
                            {idx + 1}. {q.question}
                          </h4>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => handleEditQuizQuestion(q, idx)}
                              className="rounded p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                              title="Editar Questão"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuizQuestion(idx)}
                              className="rounded p-1 text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:text-red-650 dark:hover:bg-slate-800"
                              title="Excluir Questão"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = q.correct_option_index === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`rounded p-2 border ${
                                  isCorrect
                                    ? "border-emerald-300 bg-emerald-50/20 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-450"
                                    : "border-slate-100 text-slate-500 dark:border-slate-850 dark:text-slate-400"
                                }`}
                              >
                                <span className="font-semibold block text-[9px] uppercase">
                                  Opção {String.fromCharCode(65 + oIdx)} {isCorrect && " (CORRETA)"}
                                </span>
                                <span className="mt-0.5 block">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-[10px] leading-relaxed text-slate-600 dark:bg-slate-950/30 dark:border-slate-850 dark:text-slate-400">
                            <span className="font-semibold block mb-0.5 text-slate-450">
                              Comentário do Gabarito:
                            </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER: Course Structure Tree
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">
              Estrutura do Curso
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adicione módulos, redija lições em Markdown e crie exercícios de fixação.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const duplicated = duplicateCourse(course.id);
            if (duplicated) {
              alert(`Curso duplicado com sucesso! Redirecionando para a nova cópia...`);
              navigate({ to: `/admin/course/${duplicated.id}/builder` });
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-750 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900 transition"
          title="Criar uma cópia integral deste curso"
        >
          <Copy className="h-3.5 w-3.5" /> Duplicar Curso
        </button>
      </div>

      {/* Course Meta Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        {isEditingMeta ? (
          <div className="space-y-4 animate-fade-in">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Título do Curso
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Categoria
                </label>
                <select
                  value={courseCatId}
                  onChange={(e) => setCourseCatId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Descrição
              </label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-805 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingMeta(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMeta}
                className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                <Tag className="h-3 w-3" /> {categoryName}
              </span>
              <h2 className="mt-2 font-serif text-lg font-bold text-slate-800 dark:text-slate-100">
                {course.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                {course.description || "Sem descrição fornecida."}
              </p>
            </div>
            <button
              onClick={() => setIsEditingMeta(true)}
              className="rounded p-2 text-slate-400 hover:bg-slate-105 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-205 transition"
              title="Editar Detalhes do Curso"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modules and Lessons Tree */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-slate-850 dark:text-slate-100">
            Módulos e Lições
          </h3>
          {!isAddingModule && (
            <button
              onClick={() => setIsAddingModule(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Novo Módulo
            </button>
          )}
        </div>

        {/* Add Module Form */}
        {isAddingModule && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Adicionar Módulo
            </h4>
            <form onSubmit={handleAddModuleSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Ex: Módulo 1: Panorama e Introdução"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-205"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 transition"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAddingModule(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 transition"
              >
                Cancelar
              </button>
            </form>
          </div>
        )}

        {/* Modules Tree */}
        {course.modules.length === 0 ? (
          <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
            Nenhum módulo cadastrado. Clique em "Novo Módulo" para iniciar!
          </div>
        ) : (
          <div className="space-y-4">
            {course.modules.map((mod) => {
              const isEditingMod = editingModuleId === mod.id;

              return (
                <div
                  key={mod.id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/20"
                >
                  {/* Module Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-850 dark:bg-slate-900/40 rounded-t-xl">
                    {isEditingMod ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="text"
                          value={editModuleTitle}
                          onChange={(e) => setEditModuleTitle(e.target.value)}
                          className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveModule(mod.id)}
                          className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Check className="h-4 w-4 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => setEditingModuleId(null)}
                          className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <X className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {mod.title}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenNewLessonEditor(mod.id)}
                            className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400"
                          >
                            <Plus className="h-3 w-3" /> Nova Aula
                          </button>
                          <button
                            onClick={() => handleStartEditModule(mod.id, mod.title)}
                            className="rounded p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-200 dark:hover:bg-slate-800"
                            title="Editar Módulo"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id, mod.title)}
                            className="rounded p-1 text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Excluir Módulo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Lessons list inside Module */}
                  <div className="divide-y divide-slate-100 p-2 dark:divide-slate-850">
                    {mod.lessons.length === 0 ? (
                      <div className="p-4 text-center text-[10px] text-slate-400">
                        Nenhuma lição neste módulo. Clique em "Nova Aula" para redigir uma.
                      </div>
                    ) : (
                      mod.lessons.map((les) => (
                        <div
                          key={les.id}
                          className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 rounded-lg transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                            <div>
                              <span className="text-xs font-medium text-slate-750 dark:text-slate-300">
                                {les.title}
                              </span>
                              <span className="block text-[9px] text-slate-400 mt-0.5">
                                {les.quizzes ? les.quizzes.length : 0} exercício(s) de fixação
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditLessonEditor(mod.id, les)}
                              className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                              title="Editar Lição"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(les.id, les.title)}
                              className="rounded p-1 text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:text-red-950/20"
                              title="Excluir Lição"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
