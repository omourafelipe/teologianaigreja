import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, List, ChevronDown, Award, CheckCircle2, XCircle, GraduationCap, Info } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { MarkdownRenderer, slugify } from "@/components/MarkdownRenderer";
import { SidebarDrawer } from "@/components/SidebarDrawer";
import { useCourseStore } from "@/hooks/useCourseStore";

export const Route = createFileRoute("/course/$courseId/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "Leitura — EBD Digital" }
    ],
  }),
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
  const { courseId, lessonId } = Route.useParams();
  const { findLesson } = useCourseStore();
  
  const data = findLesson(courseId, lessonId);

  if (!data) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-serif text-2xl">Lição não encontrada</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400">
            ← Voltar à biblioteca
          </Link>
        </div>
      </Layout>
    );
  }

  const { course, entry, prev, next } = data;
  const [open, setOpen] = useState(false);
  const [tocExpanded, setTocExpanded] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"reading" | "teacher" | "quiz">("reading");

  // Estados dos Exercícios / Quiz
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  // Resetar abas e estados do quiz quando mudar de lição
  useEffect(() => {
    setActiveTab("reading");
    setSelectedAnswers({});
    setSubmittedAnswers({});
  }, [lessonId]);

  // Extract headings from lesson content
  const headings = useMemo(() => {
    return extractHeadings(entry.lesson.content);
  }, [entry.lesson.content]);

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0 || activeTab !== "reading") return;

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
  }, [headings, activeTab]);

  const handleHeadingClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveHeadingId(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submittedAnswers[questionId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuestion = (questionId: string) => {
    if (selectedAnswers[questionId] === undefined) return;
    setSubmittedAnswers((prev) => ({ ...prev, [questionId]: true }));
  };

  // Cálculo da pontuação do quiz
  const quizQuestions = entry.lesson.quiz || [];
  const totalSubmitted = Object.keys(submittedAnswers).length;
  const correctCount = Object.keys(submittedAnswers).filter((qid) => {
    const question = quizQuestions.find((q) => q.id === qid);
    return question && selectedAnswers[qid] === question.correctOptionIndex;
  }).length;

  return (
    <Layout>
      <SidebarDrawer
        course={course}
        currentLessonId={entry.lesson.id}
        open={open}
        onClose={() => setOpen(false)}
      />

      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-20 z-30 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-900/40 hover:text-blue-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400"
      >
        <List className="h-3.5 w-3.5" /> Índice
      </button>

      <div className="mx-auto max-w-5xl px-6 py-12 lg:grid lg:grid-cols-[1fr_240px] lg:gap-12">
        <article className={`min-w-0 mx-auto lg:mx-0 w-full ${activeTab === "reading" ? "max-w-prose" : "lg:col-span-2 lg:max-w-3xl"}`}>
          <Link
            to="/course/$courseId"
            params={{ courseId: course.id }}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-blue-900 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {course.title}
          </Link>
          <div className="mt-6 text-xs uppercase tracking-wider text-slate-500">
            {entry.moduleTitle}
          </div>

          {/* Abas Pedagógicas (Estilo Filosofia na Escola) */}
          <div className="mt-6 flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("reading")}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "reading"
                  ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Leitura
            </button>
            <button
              onClick={() => setActiveTab("teacher")}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "teacher"
                  ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Guia do Professor
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "quiz"
                  ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Exercícios de Fixação
              {quizQuestions.length > 0 && (
                <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-400">
                  {quizQuestions.length}
                </span>
              )}
            </button>
          </div>

          {/* RENDER VIEW: Leitura */}
          {activeTab === "reading" && (
            <div className="mt-6">
              {/* Mobile Table of Contents Accordion */}
              {headings.length > 0 && (
                <div className="mb-6 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/30 lg:hidden">
                  <button
                    onClick={() => setTocExpanded(!tocExpanded)}
                    className="flex w-full items-center justify-between font-serif text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <span>Nesta lição ({headings.length} tópicos)</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                        tocExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {tocExpanded && (
                    <div className="mt-3 border-t border-slate-200/60 pt-3 dark:border-slate-800/60">
                      <div className="relative border-l border-slate-200 dark:border-slate-800 py-1 space-y-2.5">
                        {headings.map((h) => {
                          const isActive = activeHeadingId === h.id;
                          return (
                            <a
                              key={h.id}
                              href={`#${h.id}`}
                              onClick={(e) => {
                                handleHeadingClick(e, h.id);
                                setTocExpanded(false);
                              }}
                              className={`block text-xs transition-all duration-200 hover:text-blue-900 dark:hover:text-blue-400 ${
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
                  )}
                </div>
              )}

              <div className="mt-2">
                <MarkdownRenderer content={entry.lesson.content} />
              </div>
            </div>
          )}

          {/* RENDER VIEW: Guia do Professor */}
          {activeTab === "teacher" && (
            <div className="mt-6 space-y-6 animate-fade-in">
              <div className="flex gap-3 rounded-xl border border-amber-250 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/15">
                <GraduationCap className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-300">
                  <span className="font-semibold block mb-0.5">Espaço do Professor / Líder</span>
                  Este guia contém esboços de aula, sugestões didáticas e temas para debate criados especificamente para auxiliar na preparação da sua aula dominical.
                </div>
              </div>

              {entry.lesson.teacherPlan ? (
                <div className="mt-4">
                  <MarkdownRenderer content={entry.lesson.teacherPlan} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Info className="h-8 w-8 text-slate-350 dark:text-slate-650" />
                  <h4 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Guia não cadastrado</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">Esta lição ainda não possui orientações para professores cadastradas. Professores podem inseri-las pelo painel administrativo.</p>
                </div>
              )}
            </div>
          )}

          {/* RENDER VIEW: Exercícios */}
          {activeTab === "quiz" && (
            <div className="mt-6 space-y-8 animate-fade-in">
              {quizQuestions.length > 0 && totalSubmitted === quizQuestions.length && (
                <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 dark:from-emerald-950/20 dark:to-teal-950/20 dark:border-emerald-900/50">
                  <Award className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Parabéns! Exercício Concluído.</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Você acertou {correctCount} de {quizQuestions.length} questões disponíveis.</p>
                  </div>
                </div>
              )}

              {quizQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Info className="h-8 w-8 text-slate-350 dark:text-slate-650" />
                  <h4 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum exercício</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">Esta lição ainda não conta com um questionário de fixação rápida cadastrado.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {quizQuestions.map((q, qIndex) => {
                    const isSubmitted = !!submittedAnswers[q.id];
                    const selectedOption = selectedAnswers[q.id];
                    
                    return (
                      <div
                        key={q.id}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/30"
                      >
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150 leading-relaxed">
                          {qIndex + 1}. {q.questionText}
                        </h4>

                        {/* Opções */}
                        <div className="mt-4 space-y-2.5">
                          {q.options.map((option, optIdx) => {
                            const isSelected = selectedOption === optIdx;
                            const isCorrect = q.correctOptionIndex === optIdx;
                            
                            let optionStyle = "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/20";
                            let icon = null;

                            if (isSubmitted) {
                              if (isCorrect) {
                                optionStyle = "border-emerald-500 bg-emerald-50/30 dark:border-emerald-500/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-350 font-medium";
                                icon = <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                              } else if (isSelected) {
                                optionStyle = "border-red-400 bg-red-50/30 dark:border-red-500/30 dark:bg-red-950/20 text-red-900 dark:text-red-350";
                                icon = <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
                              } else {
                                optionStyle = "border-slate-150 dark:border-slate-850 opacity-50 bg-white dark:bg-slate-950/10 cursor-not-allowed";
                              }
                            } else if (isSelected) {
                              optionStyle = "border-blue-900 bg-blue-50/20 dark:border-blue-400 dark:bg-blue-950/20 font-medium";
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isSubmitted}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3.5 text-left text-xs transition-all ${optionStyle}`}
                              >
                                <span>{option}</span>
                                {icon}
                              </button>
                            );
                          })}
                        </div>

                        {/* Botão para responder */}
                        {!isSubmitted && (
                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              disabled={selectedOption === undefined}
                              onClick={() => handleSubmitQuestion(q.id)}
                              className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-400 dark:text-slate-900"
                            >
                              Confirmar Resposta
                            </button>
                          </div>
                        )}

                        {/* Gabarito Comentado */}
                        {isSubmitted && (
                          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800/80 animate-slide-down">
                            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80 dark:bg-slate-950/40 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5 dark:text-slate-400">
                                <Info className="h-3.5 w-3.5" /> Gabarito Comentado
                              </span>
                              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                {q.explanation}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <nav className="mt-16 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            {prev ? (
              <Link
                to="/course/$courseId/lesson/$lessonId"
                params={{ courseId: course.id, lessonId: prev.lesson.id }}
                className="group flex-1 rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
              >
                <div className="text-xs text-slate-500">← Anterior</div>
                <div className="mt-1 text-sm font-medium text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
                  {prev.lesson.title}
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {next ? (
              <Link
                to="/course/$courseId/lesson/$lessonId"
                params={{ courseId: course.id, lessonId: next.lesson.id }}
                className="group flex-1 rounded-lg border border-slate-200 p-4 text-right transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
              >
                <div className="text-xs text-slate-500">Próxima →</div>
                <div className="mt-1 text-sm font-medium text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
                  {next.lesson.title}
                </div>
              </Link>
            ) : (
              <div className="flex-1 text-right text-xs text-slate-500">
                <ArrowRight className="ml-auto h-4 w-4 opacity-30" />
                Fim do curso
              </div>
            )}
          </nav>
        </article>

        {/* Desktop Table of Contents Sidebar */}
        {headings.length > 0 && activeTab === "reading" && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <h2 className="mb-4 font-serif text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nesta lição
              </h2>
              <div className="relative border-l border-slate-200 dark:border-slate-800 py-1 space-y-2.5">
                {headings.map((h) => {
                  const isActive = activeHeadingId === h.id;
                  return (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={(e) => handleHeadingClick(e, h.id)}
                      className={`block text-xs transition-all duration-200 hover:text-blue-900 dark:hover:text-blue-400 ${
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
    </Layout>
  );
}
