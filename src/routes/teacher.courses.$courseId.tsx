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
  List as ListIcon
} from "lucide-react";
import { useCourseStore } from "@/hooks/useCourseStore";
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
  const [editorMode, setEditorMode] = useState<"edit" | "preview" | "split">("split");

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
    setIsEditingLesson(true);
  };

  const handleOpenEditLessonEditor = (moduleId: string, lessonId: string, title: string, content: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
    setLessonTitle(title);
    setLessonContent(content);
    setIsEditingLesson(true);
  };

  const handleSaveLesson = () => {
    if (!lessonTitle.trim()) {
      alert("Por favor, digite o título da lição.");
      return;
    }

    if (activeLessonId === null) {
      // Nova lição
      addLesson(course.id, activeModuleId, lessonTitle.trim(), lessonContent);
    } else {
      // Editar lição
      updateLesson(course.id, activeModuleId, activeLessonId, {
        title: lessonTitle.trim(),
        content: lessonContent,
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

  // Barra de ferramentas Markdown
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
    else if (syntax === "h2") replacement = `\n## ${selectedText || "Título de nível 2"}\n`;
    else if (syntax === "h3") replacement = `\n### ${selectedText || "Título de nível 3"}\n`;
    else if (syntax === "quote") replacement = `\n> ${selectedText || "Citação"}\n`;
    else if (syntax === "code") replacement = `\`${selectedText || "código"}\``;
    else if (syntax === "link") replacement = `[${selectedText || "link"}](https://exemplo.com)`;
    else if (syntax === "list") replacement = `\n- Item 1\n- Item 2\n`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setLessonContent(newContent);
    
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
            {/* View Mode Toggles */}
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

        {/* Markdown Editor Toolbar */}
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

        {/* Editor Content Area */}
        <div className="flex-1 mt-4 grid gap-6 h-full overflow-hidden" style={{
          gridTemplateColumns: editorMode === "split" ? "1fr 1fr" : "1fr"
        }}>
          {/* Editor Column */}
          {(editorMode === "edit" || editorMode === "split") && (
            <textarea
              id="lesson-textarea"
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              placeholder="Escreva a sua lição em Markdown. Use títulos (## e ###) para gerar o sumário na lateral automaticamente..."
              className="h-full min-h-[300px] w-full resize-none rounded-lg border border-slate-200 bg-white p-4 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:ring-blue-400/10"
            />
          )}

          {/* Preview Column */}
          {(editorMode === "preview" || editorMode === "split") && (
            <div className="h-full min-h-[300px] overflow-y-auto rounded-lg border border-slate-250 bg-slate-50/40 p-5 dark:border-slate-800 dark:bg-slate-900/10">
              <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
                Pré-visualização em Tempo Real
              </span>
              <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <MarkdownRenderer content={lessonContent || "*Escreva algo no editor para ver a visualização prévia...*"} />
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
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350"
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
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
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
                          className="rounded p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-200 dark:hover:text-slate-350 dark:hover:bg-slate-800/80"
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
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3 hover:border-slate-200 transition dark:border-slate-850 dark:bg-slate-950/10 dark:hover:border-slate-800"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                            <div>
                              <h5 className="text-xs font-semibold text-slate-850 dark:text-slate-250">
                                {lesson.title}
                              </h5>
                              <span className="block text-[9px] text-slate-400">
                                {lesson.content.length} caracteres
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleOpenEditLessonEditor(mod.id, lesson.id, lesson.title, lesson.content)
                              }
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-750 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                              title="Editar Lição"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(mod.id, lesson.id, lesson.title)}
                              className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/20"
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
