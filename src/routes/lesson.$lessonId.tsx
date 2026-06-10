import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, List, ChevronDown, CheckCircle, Info, HelpCircle, Columns, Eye, GraduationCap, Award, CheckCircle2, XCircle, ChevronRight, Menu } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Layout } from "@/components/Layout";
import { MarkdownRenderer, slugify } from "@/components/MarkdownRenderer";
import { useLmsStore } from "@/hooks/useLmsStore";

export const Route = createFileRoute("/lesson/$lessonId")({
  component: LessonPage,
});

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): HeadingItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: HeadingItem[] = [];
  let match;

  const cleanMarkdownText = (text: string) => {
    return text
      .replace(/\*\*|__/g, "") // Bold
      .replace(/\*|_/g, "") // Italic
      .replace(/`([^`]+)`/g, "$1") // Code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Links
  };

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    const text = cleanMarkdownText(rawText);
    const id = slugify(text);
    headings.push({ id, text, level });
  }
  return headings;
}

function LessonPage() {
  const { lessonId } = Route.useParams();
  const {
    currentUser,
    findRelationalLesson,
    getLessonProgress,
    toggleLessonProgress,
    getLessonQuizzes,
    getQuizAnswer,
    submitQuizAnswer,
    getCourseModules,
    getModuleLessons
  } = useLmsStore();
  const navigate = useNavigate();

  // Guardas de autenticação
  useEffect(() => {
    if (!currentUser && typeof window !== "undefined") {
      navigate({ to: "/login" });
    }
  }, [currentUser]);

  const data = useMemo(() => findRelationalLesson(lessonId), [lessonId, findRelationalLesson]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  // Estados dos Exercícios locais
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [justSubmitted, setJustSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Fechar barra lateral no mobile
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    setSelectedOptions({});
    setJustSubmitted({});
  }, [lessonId]);

  const { course, module, lesson, entry, prev, next } = data || {};

  // Seeding inicial de acordeão do curso na sidebar
  useEffect(() => {
    if (course) {
      setOpenModules(
        Object.fromEntries(getCourseModules(course.id).map((m) => [m.id, m.id === module?.id]))
      );
    }
  }, [course, module]);

  // Extrair cabeçalhos do markdown
  const headings = useMemo(() => {
    return lesson ? extractHeadings(lesson.content) : [];
  }, [lesson]);

  // Rastrear cabeçalhos ativos no scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      let currentActive = "";

      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentActive = headings[i].id;
          } else {
            break;
          }
        }
      }

      if (!currentActive && headings.length > 0) {
        currentActive = headings[0].id;
      }

      setActiveHeadingId(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings, lessonId]);

  if (!currentUser || !data || !course || !lesson) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-serif text-2xl">Lição não encontrada</h1>
          <Link to="/dashboard" className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400">
            ← Voltar à biblioteca
          </Link>
        </div>
      </Layout>
    );
  }

  const handleHeadingClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveHeadingId(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  const toggleModuleCollapse = (modId: string) => {
    setOpenModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Lógica do progresso da lição
  const progressRecord = getLessonProgress(currentUser.id, lesson.id);
  const isLessonCompleted = !!progressRecord?.is_completed;

  const handleToggleCompletion = () => {
    toggleLessonProgress(currentUser.id, lesson.id);
  };

  // Quizzes e Respostas
  const quizzes = getLessonQuizzes(lesson.id);

  const handleOptionSelect = (quizId: string, optionIdx: number) => {
    const savedAnswer = getQuizAnswer(currentUser.id, quizId);
    if (savedAnswer || justSubmitted[quizId]) return;

    setSelectedOptions((prev) => ({ ...prev, [quizId]: optionIdx }));
  };

  const handleAnswerSubmit = (quiz: Quiz) => {
    const selectedIdx = selectedOptions[quiz.id];
    if (selectedIdx === undefined) return;

    const isCorrect = selectedIdx === quiz.correct_option_index;
    submitQuizAnswer(currentUser.id, quiz.id, selectedIdx, isCorrect);
    setJustSubmitted((prev) => ({ ...prev, [quiz.id]: true }));
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 transition-colors">
        {/* SIDEBAR ESQUERDA: Ementa do Curso (Syllabus) */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-slate-50 p-4 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/60 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:-ml-64"
          }`}
        >
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ementa do Curso
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded p-1 hover:bg-slate-200 lg:hidden dark:hover:bg-slate-800"
              >
                <XCircle className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <Link
              to="/course/$courseId"
              params={{ courseId: course.id }}
              className="font-serif text-sm font-bold text-slate-800 hover:text-blue-900 dark:text-slate-200 dark:hover:text-blue-400 truncate block"
            >
              {course.title}
            </Link>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {getCourseModules(course.id).map((m) => {
                const isOpen = !!openModules[m.id];
                const moduleLessons = getModuleLessons(m.id);

                return (
                  <div key={m.id} className="space-y-1">
                    <button
                      onClick={() => toggleModuleCollapse(m.id)}
                      className="flex w-full items-center justify-between text-left text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <span className="truncate">{m.title}</span>
                      <ChevronDown
                        className={`h-3 w-3 shrink-0 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <ul className="pl-2.5 border-l border-slate-200 dark:border-slate-800 space-y-1">
                        {moduleLessons.map((l) => {
                          const isCurrent = l.id === lesson.id;
                          const isCompleted = getLessonProgress(currentUser.id, l.id)?.is_completed;
                          
                          return (
                            <li key={l.id}>
                              <Link
                                to="/lesson/$lessonId"
                                params={{ lessonId: l.id }}
                                className={`group flex items-center justify-between gap-1.5 rounded px-2.5 py-1.5 text-[11px] transition ${
                                  isCurrent
                                    ? "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-850 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200"
                                }`}
                              >
                                <span className="truncate">{l.title}</span>
                                {isCompleted && (
                                  <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-450 shrink-0" />
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CONTAINER PRINCIPAL */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Botão de abrir sidebar flutuante se estiver fechada */}
          <div className="sticky top-16 z-20 flex items-center bg-white/80 dark:bg-slate-900/80 px-6 py-2 border-b border-slate-100 dark:border-slate-800/40 backdrop-blur">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900"
            >
              <Menu className="h-3.5 w-3.5" />
              <span>{isSidebarOpen ? "Recolher Ementa" : "Ver Ementa"}</span>
            </button>
          </div>

          <div className="mx-auto max-w-5xl w-full px-6 py-8 lg:grid lg:grid-cols-[1fr_240px] lg:gap-12 flex-1">
            {/* TEXTO DA LIÇÃO */}
            <main className="min-w-0 max-w-prose mx-auto lg:mx-0 w-full space-y-10">
              <div className="space-y-4">
                <Link
                  to="/course/$courseId"
                  params={{ courseId: course.id }}
                  className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-500 hover:text-blue-900 dark:hover:text-blue-400"
                >
                  {course.title}
                </Link>
                <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {module.title}
                </div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                  {lesson.title}
                </h1>
              </div>

              {/* Renderização do Artigo */}
              <div className="prose-reader leading-relaxed">
                <MarkdownRenderer content={lesson.content} />
              </div>

              {/* CHECKBOX DE CONCLUSÃO */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800/80 dark:bg-slate-950/20">
                <label className="flex items-start gap-4 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      checked={isLessonCompleted}
                      onChange={handleToggleCompletion}
                      className="peer h-5 w-5 rounded border-slate-300 text-blue-900 focus:ring-blue-900/20 dark:border-slate-700 dark:text-blue-400 dark:focus:ring-blue-400/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                      Concluir leitura desta lição
                      {isLessonCompleted && (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-450 animate-pulse" />
                      )}
                    </span>
                    <span className="block text-xs text-slate-500 leading-relaxed">
                      Marque esta lição como lida para registrar o progresso e concluir o curso na biblioteca.
                    </span>
                  </div>
                </label>
              </div>

              {/* QUIZZES VINCULADOS */}
              {quizzes.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-900 dark:text-blue-400" />
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-150">
                      Exercícios de Fixação ({quizzes.length})
                    </h3>
                  </div>

                  <div className="space-y-8">
                    {quizzes.map((q, qIndex) => {
                      const savedAnswer = getQuizAnswer(currentUser.id, q.id);
                      const isSubmitted = !!savedAnswer || !!justSubmitted[q.id];
                      const selectedOption = isSubmitted
                        ? savedAnswer?.selected_option_index
                        : selectedOptions[q.id];

                      return (
                        <div
                          key={q.id}
                          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/30"
                        >
                          <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-relaxed">
                            {qIndex + 1}. {q.question}
                          </h4>

                          <div className="mt-4 space-y-2">
                            {q.options.map((option, optIdx) => {
                              const isSelected = selectedOption === optIdx;
                              const isCorrectAnswer = q.correct_option_index === optIdx;

                              let style = "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-950/20";
                              let icon = null;

                              if (isSubmitted) {
                                if (isCorrectAnswer) {
                                  style = "border-emerald-500 bg-emerald-50/20 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/20 dark:text-emerald-450 font-medium";
                                  icon = <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                                } else if (isSelected) {
                                  style = "border-red-400 bg-red-50/20 text-red-900 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-400";
                                  icon = <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
                                } else {
                                  style = "border-slate-150 opacity-40 bg-white dark:bg-slate-950/10 cursor-not-allowed";
                                }
                              } else if (isSelected) {
                                style = "border-blue-900 bg-blue-50/20 dark:border-blue-400 dark:bg-blue-950/20 font-medium";
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() => handleOptionSelect(q.id, optIdx)}
                                  className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3.5 text-left text-xs transition-all ${style}`}
                                >
                                  <span>{option}</span>
                                  {icon}
                                </button>
                              );
                            })}
                          </div>

                          {!isSubmitted && (
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                disabled={selectedOption === undefined}
                                onClick={() => handleAnswerSubmit(q)}
                                className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-400 dark:text-slate-900"
                              >
                                Enviar Resposta
                              </button>
                            </div>
                          )}

                          {isSubmitted && (
                            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800/80 animate-slide-down">
                              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/85 dark:bg-slate-950/40 dark:border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5 dark:text-slate-400">
                                  <Info className="h-3.5 w-3.5" /> Comentário de Resposta
                                </span>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                  {q.explanation || "Esta resposta foi avaliada. Veja o gabarito oficial."}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CONTROLES DE NAVEGAÇÃO */}
              <nav className="mt-16 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
                {prev ? (
                  <Link
                    to="/lesson/$lessonId"
                    params={{ lessonId: prev.lesson.id }}
                    className="group flex-1 rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
                  >
                    <div className="text-xs text-slate-500">← Anterior</div>
                    <div className="mt-1 text-xs font-medium text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
                      {prev.lesson.title}
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
                {next ? (
                  <Link
                    to="/lesson/$lessonId"
                    params={{ lessonId: next.lesson.id }}
                    className="group flex-1 rounded-lg border border-slate-200 p-4 text-right transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
                  >
                    <div className="text-xs text-slate-500">Próxima →</div>
                    <div className="mt-1 text-xs font-medium text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
                      {next.lesson.title}
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1 text-right text-[11px] text-slate-500">
                    Fim do Curso
                  </div>
                )}
              </nav>
            </main>

            {/* SIDEBAR DIREITA: Sumário do Artigo (TOC) */}
            {headings.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                  <h2 className="mb-4 font-serif text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Neste Tópico
                  </h2>
                  <div className="relative border-l border-slate-200 dark:border-slate-800 py-1 space-y-2.5">
                    {headings.map((h) => {
                      const isActive = activeHeadingId === h.id;
                      return (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          onClick={(e) => handleHeadingClick(e, h.id)}
                          className={`block text-[11px] transition-all duration-200 hover:text-blue-900 dark:hover:text-blue-400 ${
                            h.level === 3 ? "pl-8" : "pl-4"
                          } ${
                            isActive
                              ? "font-medium text-blue-900 dark:text-blue-400 border-l-2 border-blue-900 dark:border-blue-400 -ml-[1px]"
                              : "text-slate-500 border-l border-transparent"
                          }`}
                        >
                          {h.text}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
