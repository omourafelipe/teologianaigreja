import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
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
  HelpCircle,
  Tag
} from "lucide-react";
import { useCourseStore, QuizQuestion } from "@/hooks/useCourseStore";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export const Route = createFileRoute("/teacher/courses/$courseId")({
  component: CourseEditorPage,
});

function CourseEditorPage() {
  const { courseId } = Route.useParams();
  const {
    getCourse,
    updateCourse,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson
  } = useCourseStore();

  const course = getCourse(courseId);

  // Estados do formulário do curso
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [courseTitle, setCourseTitle] = useState(course?.title || "");
  const [courseDesc, setCourseDesc] = useState(course?.description || "");

  // Estados dos Módulos
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");

  // Estados do Editor de Lição
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string>("");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null); // null se for nova lição
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonTeacherPlan, setLessonTeacherPlan] = useState("");
  const [lessonQuiz, setLessonQuiz] = useState<QuizQuestion[]>([]);
  
  const [activeEditorTab, setActiveEditorTab] = useState<"content" | "teacherPlan" | "quiz">("content");
  const [editorMode, setEditorMode] = useState<"edit" | "preview" | "split">("split");

  // Estados do Criador de Questões de Quiz
  const [quizQuestionText, setQuizQuestionText] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState("");
  const [editingQuizQuestionId, setEditingQuizQuestionId] = useState<string | null>(null);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-serif text-2xl">Curso não encontrado</h1>
        <Link to="/teacher/courses" className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400">
          ← Voltar aos cursos
        </Link>
      </div>
    );
  }

  // Ações de metadados do curso
  const handleSaveMeta = () => {
    if (!courseTitle.trim()) return;
    updateCourse(course.id, {
      title: courseTitle.trim(),
      description: courseDesc.trim(),
    });
    setIsEditingMeta(false);
  };

  // Ações de Módulos
  const handleAddModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    addModule(course.id, newModuleTitle.trim());
    setNewModuleTitle("");
    setIsAddingModule(false);
  };

  const handleStartEditModule = (id: string, currentTitle: string) => {
    setEditingModuleId(id);
    setEditModuleTitle(currentTitle);
  };

  const handleSaveModule = (id: string) => {
    if (!editModuleTitle.trim()) return;
    updateModule(course.id, id, editModuleTitle.trim());
    setEditingModuleId(null);
  };

  // Ações de Lições (Abertura do Editor)
  const handleOpenNewLessonEditor = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(null);
    setLessonTitle("");
    setLessonContent("");
    setLessonTeacherPlan("");
    setLessonQuiz([]);
    setActiveEditorTab("content");
    setIsEditingLesson(true);
  };

  const handleOpenEditLessonEditor = (
    moduleId: string,
    lessonId: string,
    title: string,
    content: string,
    teacherPlan?: string,
    quizData?: QuizQuestion[]
  ) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
    setLessonTitle(title);
    setLessonContent(content);
    setLessonTeacherPlan(teacherPlan || "");
    setLessonQuiz(quizData || []);
    setActiveEditorTab("content");
    setIsEditingLesson(true);
  };

  const handleSaveLesson = () => {
    if (!lessonTitle.trim()) {
      alert("Por favor, digite o título da lição.");
      return;
    }

    if (activeLessonId === null) {
      // Nova lição
      addLesson(
        course.id,
        activeModuleId,
        lessonTitle.trim(),
        lessonContent,
        lessonTeacherPlan,
        lessonQuiz
      );
    } else {
      // Editar lição
      updateLesson(course.id, activeModuleId, activeLessonId, {
        title: lessonTitle.trim(),
        content: lessonContent,
        teacherPlan: lessonTeacherPlan,
        quiz: lessonQuiz
      });
    }

    setIsEditingLesson(false);
    setActiveLessonId(null);
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string, title: string) => {
    if (confirm(`Deseja excluir a lição "${title}"?`)) {
      deleteLesson(course.id, moduleId, lessonId);
    }
  };

  // Lógica do Criador de Questões de Quiz
  const handleSaveQuizQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestionText.trim()) return;
    if (quizOptions.some(opt => !opt.trim())) {
      alert("Por favor, preencha todas as 4 alternativas.");
      return;
    }

    if (editingQuizQuestionId === null) {
      // Adicionar nova questão
      const newQuestion: QuizQuestion = {
        id: "q-" + Math.random().toString(36).substring(2, 9),
        questionText: quizQuestionText.trim(),
        options: quizOptions.map(o => o.trim()),
        correctOptionIndex: quizCorrectIndex,
        explanation: quizExplanation.trim()
      };
      setLessonQuiz(prev => [...prev, newQuestion]);
    } else {
      // Atualizar questão existente
      setLessonQuiz(prev => prev.map(q => 
        q.id === editingQuizQuestionId ? {
          ...q,
          questionText: quizQuestionText.trim(),
          options: quizOptions.map(o => o.trim()),
          correctOptionIndex: quizCorrectIndex,
          explanation: quizExplanation.trim()
        } : q
      ));
      setEditingQuizQuestionId(null);
    }

    // Limpar campos
    setQuizQuestionText("");
    setQuizOptions(["", "", "", ""]);
    setQuizCorrectIndex(0);
    setQuizExplanation("");
  };

  const handleEditQuizQuestion = (question: QuizQuestion) => {
    setEditingQuizQuestionId(question.id);
    setQuizQuestionText(question.questionText);
    setQuizOptions([...question.options]);
    setQuizCorrectIndex(question.correctOptionIndex);
    setQuizExplanation(question.explanation);
  };

  const handleDeleteQuizQuestion = (id: string) => {
    setLessonQuiz(prev => prev.filter(q => q.id !== id));
  };

  // Barra de ferramentas Markdown
  const insertMarkdown = (syntax: string) => {
    const textareaId = activeEditorTab === "content" ? "lesson-textarea" : "teacher-plan-textarea";
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let replacement = "";
    if (syntax === "bold") replacement = `**${selectedText || "negrito"}**`;
    else if (syntax === "italic") replacement = `*${selectedText || "itálico"}*`;
    else if (syntax === "h2") replacement = `\n## ${selectedText || "Título de nível 2"}\n`;
    else if (syntax === "h3") replacement = `\n### ${selectedText || "Título de nível 3"}\n`;
    else if (syntax === "quote") replacement = `\n> ${selectedText || "Citação"}\n`;
    else if (syntax === "code") replacement = `\`${selectedText || "código"}\``;
    else if (syntax === "link") replacement = `[${selectedText || "link"}](https://exemplo.com)`;
    else if (syntax === "list") replacement = `\n- Item 1\n- Item 2\n`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    if (activeEditorTab === "content") {
      setLessonContent(newContent);
    } else {
      setLessonTeacherPlan(newContent);
    }
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  // RENDER: Editor de Lição
  if (isEditingLesson) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
        {/* Editor Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingLesson(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {activeLessonId === null ? "Nova Lição" : "Editando Lição"}
              </span>
              <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-50">
                {lessonTitle || "Sem título"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggles (only for textareas) */}
            {activeEditorTab !== "quiz" && (
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={() => setEditorMode("edit")}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    editorMode === "edit"
                      ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-250"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  }`}
                >
                  <FileText className="inline h-3.5 w-3.5 mr-1" /> Editar
                </button>
                <button
                  onClick={() => setEditorMode("preview")}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    editorMode === "preview"
                      ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-250"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  }`}
                >
                  <Eye className="inline h-3.5 w-3.5 mr-1" /> Visualizar
                </button>
                <button
                  onClick={() => setEditorMode("split")}
                  className={`hidden md:block rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    editorMode === "split"
                      ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-250"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                  }`}
                >
                  <Columns className="inline h-3.5 w-3.5 mr-1" /> Lado a Lado
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

        {/* Lesson Title input */}
        <div className="mt-4">
          <input
            type="text"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="Título da Lição (ex: Lição 1: O Que É Hermenêutica?)"
            className="w-full border-b border-slate-200 bg-transparent py-2 text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:text-slate-50 dark:focus:border-blue-400"
          />
        </div>

        {/* Abas do Editor de Conteúdo */}
        <div className="flex border-b border-slate-200/60 dark:border-slate-800/60 mt-4">
          <button
            onClick={() => setActiveEditorTab("content")}
            className={`border-b-2 px-4 py-2 text-xs font-semibold transition-all ${
              activeEditorTab === "content"
                ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Artigo de Leitura
          </button>
          <button
            onClick={() => setActiveEditorTab("teacherPlan")}
            className={`border-b-2 px-4 py-2 text-xs font-semibold transition-all ${
              activeEditorTab === "teacherPlan"
                ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Guia do Professor (Esboço)
          </button>
          <button
            onClick={() => setActiveEditorTab("quiz")}
            className={`border-b-2 px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeEditorTab === "quiz"
                ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Exercícios (Quiz)
            {lessonQuiz.length > 0 && (
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                {lessonQuiz.length}
              </span>
            )}
          </button>
        </div>

        {/* Toolbar (Only for Markdown Tabs) */}
        {activeEditorTab !== "quiz" && (
          <div className="flex flex-wrap gap-1 border-b border-slate-200/60 py-2 dark:border-slate-800/60">
            <button onClick={() => insertMarkdown("bold")} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded" title="Negrito"><Bold className="h-4 w-4" /></button>
            <button onClick={() => insertMarkdown("italic")} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded" title="Itálico"><Italic className="h-4 w-4" /></button>
            <button onClick={() => insertMarkdown("h2")} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded" title="Subtítulo H2"><Heading2 className="h-4 w-4" /></button>
            <button onClick={() => insertMarkdown("h3")} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded" title="Subtítulo H3"><Heading3 className="h-4 w-4" /></button>
            <div className="w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 my-1.5"></div>
            <button onClick={() => insertMarkdown("quote")} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded" title="Citação"><Quote className="h-4 w-4" /></button>
            <button onClick={() => insertMarkdown("code")} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded" title="Código"><Code className="h-4 w-4" /></button>
            <button onClick={() => insertMarkdown("link")} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded" title="Link"><Link2 className="h-4 w-4" /></button>
            <button onClick={() => insertMarkdown("list")} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded" title="Lista"><ListIcon className="h-4 w-4" /></button>
          </div>
        )}

        {/* EDITOR TABS CONTENTS */}
        <div className="flex-1 mt-4 overflow-y-auto h-full pr-2">
          {/* TAB 1: Artigo de Leitura */}
          {activeEditorTab === "content" && (
            <div className="grid gap-6 h-full min-h-[350px]" style={{
              gridTemplateColumns: editorMode === "split" ? "1fr 1fr" : "1fr"
            }}>
              {(editorMode === "edit" || editorMode === "split") && (
                <textarea
                  id="lesson-textarea"
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Escreva o artigo de leitura da lição em Markdown..."
                  className="h-full min-h-[300px] w-full resize-none rounded-lg border border-slate-200 bg-white p-4 text-sm font-mono text-slate-850 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                />
              )}
              {(editorMode === "preview" || editorMode === "split") && (
                <div className="h-full min-h-[300px] overflow-y-auto rounded-lg border border-slate-250 bg-slate-50/40 p-5 dark:border-slate-850 dark:bg-slate-900/10">
                  <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Artigo - Visualização</span>
                  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <MarkdownRenderer content={lessonContent || "*Escreva no editor para visualizar...*"} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Guia do Professor */}
          {activeEditorTab === "teacherPlan" && (
            <div className="grid gap-6 h-full min-h-[350px]" style={{
              gridTemplateColumns: editorMode === "split" ? "1fr 1fr" : "1fr"
            }}>
              {(editorMode === "edit" || editorMode === "split") && (
                <textarea
                  id="teacher-plan-textarea"
                  value={lessonTeacherPlan}
                  onChange={(e) => setLessonTeacherPlan(e.target.value)}
                  placeholder="Escreva orientações para líderes, dinâmicas e roteiro de debate para a aula dominical..."
                  className="h-full min-h-[300px] w-full resize-none rounded-lg border border-slate-200 bg-white p-4 text-sm font-mono text-slate-850 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                />
              )}
              {(editorMode === "preview" || editorMode === "split") && (
                <div className="h-full min-h-[300px] overflow-y-auto rounded-lg border border-slate-250 bg-slate-50/40 p-5 dark:border-slate-850 dark:bg-slate-900/10">
                  <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Guia do Professor - Visualização</span>
                  <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <MarkdownRenderer content={lessonTeacherPlan || "*Escreva as orientações pedagógicas para visualizar...*"} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Quiz Builder */}
          {activeEditorTab === "quiz" && (
            <div className="grid gap-6 lg:grid-cols-5 animate-fade-in pb-10">
              {/* Question Editor Form */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 lg:col-span-2 space-y-4">
                <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-250">
                  {editingQuizQuestionId === null ? "Adicionar Questão" : "Editar Questão"}
                </h3>
                <form onSubmit={handleSaveQuizQuestion} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      Enunciado da Pergunta *
                    </label>
                    <input
                      type="text"
                      value={quizQuestionText}
                      onChange={(e) => setQuizQuestionText(e.target.value)}
                      placeholder="Ex: Qual foi o abismo analisado nesta lição?"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">
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
                            className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-250"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      Gabarito Comentado (Explicação)
                    </label>
                    <textarea
                      value={quizExplanation}
                      onChange={(e) => setQuizExplanation(e.target.value)}
                      placeholder="Explique porque a resposta selecionada é a correta..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    {editingQuizQuestionId !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuizQuestionId(null);
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
                      {editingQuizQuestionId === null ? "Adicionar Questão" : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Questions List */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 lg:col-span-3">
                <h3 className="mb-4 font-serif text-sm font-bold text-slate-800 dark:text-slate-250">
                  Questões Adicionadas ({lessonQuiz.length})
                </h3>

                {lessonQuiz.length === 0 ? (
                  <div className="flex h-48 items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg dark:border-slate-800">
                    Nenhuma questão cadastrada para esta lição.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessonQuiz.map((q, idx) => (
                      <div
                        key={q.id}
                        className="rounded-lg border border-slate-100 p-4 dark:border-slate-850 dark:bg-slate-950/20 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                            {idx + 1}. {q.questionText}
                          </h4>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => handleEditQuizQuestion(q)}
                              className="rounded p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-900"
                              title="Editar Questão"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuizQuestion(q.id)}
                              className="rounded p-1 text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:text-red-650 dark:hover:bg-slate-900"
                              title="Excluir Questão"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = q.correctOptionIndex === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`rounded p-2 border ${
                                  isCorrect
                                    ? "border-emerald-300 bg-emerald-50/20 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/25 dark:text-emerald-400"
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
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-[10px] leading-relaxed text-slate-600 dark:bg-slate-950/20 dark:border-slate-850 dark:text-slate-450">
                            <span className="font-semibold block mb-0.5 text-slate-400">Comentário do Gabarito:</span>
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

  // RENDER: Course Structure Builder
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/teacher/courses"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Estrutura do Curso
          </h1>
          <p className="text-xs text-slate-500">
            Adicione módulos e redija as lições em formato Markdown.
          </p>
        </div>
      </div>

      {/* Course Meta Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
        {isEditingMeta ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Título do Curso
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Descrição
              </label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingMeta(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-355"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMeta}
                className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                {course.category}
              </span>
              <h2 className="mt-2.5 font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
                {course.title}
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                {course.description || "Nenhuma descrição fornecida."}
              </p>
            </div>
            <button
              onClick={() => setIsEditingMeta(true)}
              className="rounded p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              title="Editar Título e Descrição"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modules list & Course Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
            Módulos e Lições
          </h3>
          {!isAddingModule && (
            <button
              onClick={() => setIsAddingModule(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" /> Novo Módulo
            </button>
          )}
        </div>

        {/* Add Module Inline Form */}
        {isAddingModule && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/20">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Adicionar Módulo
            </h4>
            <form onSubmit={handleAddModuleSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Ex: Módulo 1: Fundamentos da Interpretação"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-850 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAddingModule(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-655 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
              >
                Cancelar
              </button>
            </form>
          </div>
        )}

        {/* Course Modules and Lessons List */}
        {course.modules.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
            Nenhum módulo criado neste curso. Comece criando um módulo acima!
          </div>
        ) : (
          <div className="space-y-4">
            {course.modules.map((mod) => {
              const isEditingMod = editingModuleId === mod.id;
              return (
                <div
                  key={mod.id}
                  className="rounded-xl border border-slate-250/60 bg-white shadow-sm dark:border-slate-850 dark:bg-slate-900/20"
                >
                  {/* Module Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-850 dark:bg-slate-900/40 rounded-t-xl">
                    {isEditingMod ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="text"
                          value={editModuleTitle}
                          onChange={(e) => setEditModuleTitle(e.target.value)}
                          className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200">
                          {mod.title}
                        </h4>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-455 dark:bg-slate-800 dark:text-slate-400">
                          {mod.lessons.length} lição(ões)
                        </span>
                        <button
                          onClick={() => handleStartEditModule(mod.id, mod.title)}
                          className="rounded p-1 text-slate-400 hover:text-slate-655 hover:bg-slate-200 dark:hover:text-slate-350 dark:hover:bg-slate-800/80"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenNewLessonEditor(mod.id)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-900 hover:underline dark:text-blue-400"
                      >
                        <Plus className="h-3 w-3" /> Nova Lição
                      </button>
                      <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir o módulo "${mod.title}"? Todas as lições deste módulo serão apagadas.`)) {
                            deleteModule(course.id, mod.id);
                          }
                        }}
                        className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Excluir Módulo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List inside Module */}
                  <div className="p-3 space-y-2">
                    {mod.lessons.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        Nenhuma lição adicionada neste módulo.
                      </div>
                    ) : (
                      mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3 hover:border-slate-200 transition dark:border-slate-855 dark:bg-slate-955/10 dark:hover:border-slate-800"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                            <div>
                              <h5 className="text-xs font-semibold text-slate-850 dark:text-slate-250">
                                {lesson.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400">
                                <span>{lesson.content.length} carac.</span>
                                {lesson.teacherPlan && (
                                  <span className="rounded bg-amber-50 px-1 py-0.2 text-[8px] text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-medium">Guia do Prof.</span>
                                )}
                                {lesson.quiz && lesson.quiz.length > 0 && (
                                  <span className="rounded bg-emerald-50 px-1 py-0.2 text-[8px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-medium">{lesson.quiz.length} Questões</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleOpenEditLessonEditor(mod.id, lesson.id, lesson.title, lesson.content, lesson.teacherPlan, lesson.quiz)
                              }
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-750 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                              title="Editar Lição"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(mod.id, lesson.id, lesson.title)}
                              className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-655 dark:hover:bg-red-950/20"
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
