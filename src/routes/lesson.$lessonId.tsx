import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  List,
  ChevronDown,
  CheckCircle,
  Info,
  HelpCircle,
  Eye,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Menu,
  Plus,
  Trash2,
  Edit2,
  Play,
  Volume2,
  FileText,
  Send,
  Heart,
  MessageCircle,
  Clock,
  Compass,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
    getModuleLessons,

    // Notes, Assessment, Polls, Comments
    getLessonNotes,
    addLessonNote,
    deleteLessonNote,
    submitSelfAssessment,
    getSelfAssessmentsByLesson,
    getPollByLesson,
    getPollVotesCount,
    submitPollVote,
    getUserPollVote,
    getComments,
    addComment,
    toggleCommentLike,
    deleteComment,
    sendTutorMessage,
    submitQuizAttempt,
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

  // Kindle comfort options
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");
  const [readingTheme, setReadingTheme] = useState<"light" | "sepia" | "dark">("light");

  // Media Player Speed controls
  const [mediaSpeed, setMediaSpeed] = useState<number>(1);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  // Notes and commentary states
  const [newNote, setNewNote] = useState("");
  const [newComment, setNewComment] = useState("");

  // Self assessment states
  const [compRating, setCompRating] = useState<number>(5);
  const [confRating, setConfRating] = useState<number>(5);
  const [isClarityGood, setIsClarityGood] = useState<boolean>(true);
  const [isAssessmentSubmitted, setIsAssessmentSubmitted] = useState<boolean>(false);

  // AI Tutor states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Estados dos Exercícios locais
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [justSubmitted, setJustSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    setSelectedOptions({});
    setJustSubmitted({});
    setIsAssessmentSubmitted(false);
    setAiResponse("");
    setAiPrompt("");
  }, [lessonId]);

  const { course, module, lesson, entry, prev, next } = data || {};

  const courseId = course?.id;
  const moduleId = module?.id;

  // Acordeão do curso na sidebar
  useEffect(() => {
    if (courseId) {
      setOpenModules(
        Object.fromEntries(getCourseModules(courseId).map((m) => [m.id, m.id === moduleId])),
      );
    }
  }, [courseId, moduleId]);

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
          <Link
            to="/dashboard"
            className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400"
          >
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

    // Registrar tentativa no histórico
    submitQuizAttempt(currentUser.id, lesson.id, isCorrect ? 100 : 0, 1, isCorrect, {
      [quiz.id]: selectedIdx,
    });
  };

  // Polls/Enquetes
  const poll = getPollByLesson(lesson.id);
  const pollVotes = poll ? getPollVotesCount(poll.id) : null;
  const userVote = poll ? getUserPollVote(poll.id, currentUser.id) : null;

  const handleVote = (optionIdx: number) => {
    if (poll) {
      submitPollVote(poll.id, currentUser.id, optionIdx);
    }
  };

  // Notes & Comments
  const notes = getLessonNotes(currentUser.id, lesson.id);
  const comments = getComments("lesson", lesson.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addLessonNote(currentUser.id, lesson.id, newNote);
    setNewNote("");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(currentUser.id, "lesson", lesson.id, newComment);
    setNewComment("");
  };

  // Self assessment submit
  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSelfAssessment(currentUser.id, lesson.id, compRating, confRating, isClarityGood);
    setIsAssessmentSubmitted(true);
  };

  // AI Tutor messaging
  const handleAiTutorQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    const answer = await sendTutorMessage(lesson.content, aiPrompt);
    setAiResponse(answer);
    setIsAiLoading(false);
  };

  // Font size multiplier
  const fontSizeStyle = () => {
    if (fontSize === "sm") return { fontSize: "14px" };
    if (fontSize === "lg") return { fontSize: "19px" };
    if (fontSize === "xl") return { fontSize: "22px" };
    return { fontSize: "16px" };
  };

  return (
    <Layout>
      {/* Container Principal com controle de Tema de Leitura */}
      <div
        className={`flex min-h-[calc(100vh-4rem)] ${
          readingTheme === "sepia"
            ? "sepia"
            : readingTheme === "dark"
              ? "dark bg-slate-950 text-slate-100"
              : "bg-white text-slate-800"
        } transition-colors`}
      >
        {/* SIDEBAR ESQUERDA: Ementa do Curso */}
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
                className="rounded p-1 hover:bg-slate-200 lg:hidden dark:hover:bg-slate-850"
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
          {/* Barra superior de controles e toc */}
          <div className="sticky top-16 z-20 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 px-6 py-2.5 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900"
            >
              <Menu className="h-3.5 w-3.5" />
              <span>{isSidebarOpen ? "Recolher Ementa" : "Ver Ementa"}</span>
            </button>

            {/* KINDLE STYLE READING OPTIONS */}
            <div className="flex items-center gap-3">
              {/* Font Sizer */}
              <div className="flex items-center border border-slate-250 dark:border-slate-750 rounded-lg overflow-hidden bg-white dark:bg-slate-900 text-[10px] font-bold">
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-2 py-1.5 border-r border-slate-200 dark:border-slate-800 ${fontSize === "sm" ? "bg-slate-100 dark:bg-slate-800 text-blue-900" : "text-slate-500"}`}
                  title="Fonte Menor"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize("md")}
                  className={`px-2.5 py-1.5 border-r border-slate-200 dark:border-slate-800 ${fontSize === "md" ? "bg-slate-100 dark:bg-slate-800 text-blue-900" : "text-slate-500"}`}
                  title="Fonte Padrão"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-2.5 py-1.5 border-r border-slate-200 dark:border-slate-800 ${fontSize === "lg" ? "bg-slate-100 dark:bg-slate-800 text-blue-900" : "text-slate-500"}`}
                  title="Fonte Grande"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize("xl")}
                  className={`px-2 py-1.5 ${fontSize === "xl" ? "bg-slate-100 dark:bg-slate-800 text-blue-950" : "text-slate-500"}`}
                  title="Fonte Gigante"
                >
                  A++
                </button>
              </div>

              {/* Theme selectors */}
              <div className="flex items-center border border-slate-250 dark:border-slate-750 rounded-lg overflow-hidden bg-white dark:bg-slate-900 p-0.5">
                <button
                  onClick={() => setReadingTheme("light")}
                  className={`h-5 w-5 rounded-md bg-white border border-slate-200 dark:border-slate-800 ${readingTheme === "light" ? "ring-2 ring-blue-900" : ""}`}
                  title="Tema Claro"
                />
                <button
                  onClick={() => setReadingTheme("sepia")}
                  className={`h-5 w-5 rounded-md ml-1 bg-[#f4ecd8] border border-[#dcd1b5] ${readingTheme === "sepia" ? "ring-2 ring-amber-800" : ""}`}
                  title="Tema Sepia"
                />
                <button
                  onClick={() => setReadingTheme("dark")}
                  className={`h-5 w-5 rounded-md ml-1 bg-slate-950 border border-slate-850 ${readingTheme === "dark" ? "ring-2 ring-blue-400" : ""}`}
                  title="Tema Escuro"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-5xl w-full px-6 py-8 lg:grid lg:grid-cols-[1fr_240px] lg:gap-12 flex-1">
            {/* TEXTO DA LIÇÃO */}
            <main className="min-w-0 max-w-prose mx-auto lg:mx-0 w-full space-y-10">
              {/* Cabeçalho da Lição */}
              <div className="space-y-4">
                <Link
                  to="/course/$courseId"
                  params={{ courseId: course.id }}
                  className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-blue-900 dark:hover:text-blue-400"
                >
                  {course.title}
                </Link>
                <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {module.title}
                </div>
                <h1 className="font-serif text-3xl font-bold tracking-tight leading-tight">
                  {lesson.title}
                </h1>

                {/* Tempo Estimado */}
                <div className="flex items-center gap-2.5 text-xs text-slate-450 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>⏱️ {lesson.estimated_reading_time || 5} min de leitura confortável</span>
                </div>
              </div>

              {/* MEDIA BLOCKS: VÍDEO, ÁUDIO, PDF */}
              {lesson.content_type === "video" && lesson.media_url && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-850 dark:bg-slate-950/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Play className="h-4 w-4" /> Bloco de Vídeo da Lição
                    </span>

                    {/* Velocidade */}
                    <select
                      value={mediaSpeed}
                      onChange={(e) => setMediaSpeed(Number(e.target.value))}
                      className="rounded border border-slate-200 py-1 px-2 text-[10px] font-bold dark:border-slate-800"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1.0x (Padrão)</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2.0x</option>
                    </select>
                  </div>

                  <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <video
                      src={lesson.media_url}
                      controls
                      className="w-full h-full object-cover"
                      style={{ playbackRate: mediaSpeed } as any}
                    />
                  </div>

                  {lesson.transcript && (
                    <div className="border-t border-slate-200/50 pt-3 dark:border-slate-800/50">
                      <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="flex w-full items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        <span>Ver Transcrição do Vídeo</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${showTranscript ? "rotate-180" : ""}`}
                        />
                      </button>
                      {showTranscript && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-250 dark:border-slate-800 italic">
                          "{lesson.transcript}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {lesson.content_type === "audio" && lesson.media_url && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-850 dark:bg-slate-950/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="h-4 w-4" /> Bloco de Áudio Integrado
                    </span>

                    <select
                      value={mediaSpeed}
                      onChange={(e) => setMediaSpeed(Number(e.target.value))}
                      className="rounded border border-slate-200 py-1 px-2 text-[10px] font-bold dark:border-slate-800"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1.0x (Padrão)</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2.0x</option>
                    </select>
                  </div>
                  <audio
                    src={lesson.media_url}
                    controls
                    className="w-full"
                    style={{ playbackRate: mediaSpeed } as any}
                  />
                </div>
              )}

              {lesson.content_type === "pdf" && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-850 dark:bg-slate-950/20 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-50 p-2.5 text-red-655 dark:bg-red-950/30 dark:text-red-400 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Material de Apoio (PDF)
                      </h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400">
                        Apostila oficial em PDF para leitura e download.
                      </p>
                    </div>
                  </div>
                  <a
                    href={lesson.pdf_url || "#"}
                    download
                    className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-3.5 py-2 uppercase tracking-wide dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
                  >
                    Baixar PDF
                  </a>
                </div>
              )}

              {/* Renderização do Artigo com tamanho de fonte Kindle-style */}
              <div className="prose-reader leading-relaxed" style={fontSizeStyle()}>
                <MarkdownRenderer content={lesson.content} />
              </div>

              {/* CHECKBOX DE CONCLUSÃO */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-850 dark:bg-slate-950/20">
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
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-450" />
                      )}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Marque esta lição como concluída para registrar seu progresso e ganhar +20 XP!
                    </span>
                  </div>
                </label>
              </div>

              {/* REFLEXÃO & ENQUETE DO DIA */}
              {poll && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/20 space-y-4">
                  <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Compass className="h-4.5 w-4.5 text-blue-900 dark:text-blue-400" /> Enquete de
                    Reflexão
                  </h3>
                  <p className="text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-400">
                    {poll.question}
                  </p>

                  {userVote ? (
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-bold">
                        Voto registrado! Obrigado por participar.
                      </p>
                      {poll.options.map((option, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span
                              className={
                                userVote.selected_option_index === idx
                                  ? "font-bold text-blue-900 dark:text-blue-400"
                                  : ""
                              }
                            >
                              {option}
                            </span>
                            <span>{userVote.selected_option_index === idx ? "Seu Voto" : ""}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${userVote.selected_option_index === idx ? "bg-blue-800" : "bg-slate-300 dark:bg-slate-700"}`}
                              style={{
                                width: userVote.selected_option_index === idx ? "100%" : "20%",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {poll.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleVote(idx)}
                          className="w-full text-left rounded-xl border border-slate-200 hover:border-slate-350 bg-white p-3.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-900/10 transition"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AUTOAVALIAÇÃO REFLEXIVA */}
              {!isAssessmentSubmitted ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/20 space-y-4">
                  <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-yellow-500 fill-current" /> Autoavaliação
                    Reflexiva
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                    Como foi o seu aproveitamento nesta leitura? Envie sua resposta para ganhar +10
                    XP.
                  </p>

                  <form
                    onSubmit={handleAssessmentSubmit}
                    className="space-y-4 text-xs font-semibold"
                  >
                    <div className="space-y-1">
                      <span className="block text-slate-600 dark:text-slate-350">
                        1. Quanto você compreendeu deste conteúdo?
                      </span>
                      <select
                        value={compRating}
                        onChange={(e) => setCompRating(Number(e.target.value))}
                        className="w-full rounded border border-slate-250 p-2 dark:border-slate-800 dark:bg-slate-900/40"
                      >
                        <option value={5}>Excelente compreensão (5/5)</option>
                        <option value={4}>Boa compreensão (4/5)</option>
                        <option value={3}>Compreendi o básico (3/5)</option>
                        <option value={2}>Muitas dúvidas (2/5)</option>
                        <option value={1}>Não compreendi nada (1/5)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-slate-600 dark:text-slate-350">
                        2. Qual o seu nível de confiança no assunto?
                      </span>
                      <select
                        value={confRating}
                        onChange={(e) => setConfRating(Number(e.target.value))}
                        className="w-full rounded border border-slate-250 p-2 dark:border-slate-800 dark:bg-slate-900/40"
                      >
                        <option value={5}>Extremamente confiante (5/5)</option>
                        <option value={4}>Confiante (4/5)</option>
                        <option value={3}>Parcialmente confiante (3/5)</option>
                        <option value={2}>Pouco confiante (2/5)</option>
                        <option value={1}>Sem confiança (1/5)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/45 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <input
                        type="checkbox"
                        id="clarityCheck"
                        checked={isClarityGood}
                        onChange={(e) => setIsClarityGood(e.target.checked)}
                        className="rounded border-slate-300 text-blue-900"
                      />
                      <label
                        htmlFor="clarityCheck"
                        className="text-[11px] text-slate-600 dark:text-slate-400 select-none cursor-pointer"
                      >
                        O tema e as definições teológicas foram claros?
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-3.5 py-2 uppercase tracking-wide dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
                    >
                      Enviar Autoavaliação
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/10 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="text-xs text-emerald-900 dark:text-emerald-350">
                    <span className="font-bold block mb-0.5">Autoavaliação Enviada!</span>
                    Sua resposta foi registrada no painel de analytics pessoal. +10 XP creditado.
                  </div>
                </div>
              )}

              {/* QUIZZES VINCULADOS */}
              {quizzes.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-900 dark:text-blue-400" />
                    <h3 className="font-serif text-lg font-bold">
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
                          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/20"
                        >
                          <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-relaxed">
                            {qIndex + 1}. {q.question}
                          </h4>

                          <div className="mt-4 space-y-2">
                            {q.options.map((option, optIdx) => {
                              const isSelected = selectedOption === optIdx;
                              const isCorrectAnswer = q.correct_option_index === optIdx;

                              let style =
                                "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900/10";
                              let icon = null;

                              if (isSubmitted) {
                                if (isCorrectAnswer) {
                                  style =
                                    "border-emerald-500 bg-emerald-50/20 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/20 dark:text-emerald-450 font-bold";
                                  icon = (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  );
                                } else if (isSelected) {
                                  style =
                                    "border-red-400 bg-red-50/20 text-red-900 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-400";
                                  icon = <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
                                } else {
                                  style =
                                    "border-slate-150 opacity-40 bg-white dark:bg-slate-900/5 cursor-not-allowed";
                                }
                              } else if (isSelected) {
                                style =
                                  "border-blue-900 bg-blue-50/20 dark:border-blue-400 dark:bg-blue-950/20 font-bold";
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

                          {isSubmitted && q.explanation && (
                            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800/80 animate-slide-down">
                              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/85 dark:bg-slate-900/40 dark:border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5 dark:text-slate-450">
                                  <Info className="h-3.5 w-3.5" /> Comentário de Resposta
                                </span>
                                <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-400">
                                  {q.explanation}
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

              {/* TUTOR INTELIGENTE IA */}
              <div className="rounded-2xl border border-blue-900/30 bg-blue-50/10 p-5 dark:border-blue-500/20 dark:bg-slate-950/20 space-y-4">
                <h3 className="font-serif text-sm font-bold text-blue-950 dark:text-blue-400 flex items-center gap-1.5">
                  <Bot className="h-4.5 w-4.5" /> Tutor Educacional IA
                </h3>
                <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal">
                  Tem alguma dúvida conceitual, histórica ou exegética sobre esta lição? Pergunte ao
                  assistente virtual.
                </p>

                {aiResponse && (
                  <div className="rounded-xl bg-slate-100 p-4 border border-slate-250 dark:bg-slate-900/40 dark:border-slate-800 animate-slide-down">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                      <Bot className="h-3.5 w-3.5" /> Explicação do Tutor
                    </span>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-serif whitespace-pre-line">
                      {aiResponse}
                    </p>
                  </div>
                )}

                <form onSubmit={handleAiTutorQuery} className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Qual o contexto da exegese no texto? ou Resuma a lição..."
                    className="flex-1 rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs placeholder:text-slate-450 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-4 py-2 uppercase tracking-wide disabled:opacity-50 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition shrink-0 flex items-center gap-1.5"
                  >
                    {isAiLoading ? "Processando..." : "Perguntar"} <Send className="h-3 w-3" />
                  </button>
                </form>
              </div>

              {/* ANOTAÇÕES PESSOAIS */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/20 space-y-4">
                <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Edit2 className="h-4.5 w-4.5 text-blue-900 dark:text-blue-400" /> Suas Notas
                  Pessoais
                </h3>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escreva uma reflexão, anotação ou esboço teológico para salvar no seu perfil..."
                    className="w-full rounded-xl border border-slate-250 bg-white p-3 text-xs placeholder:text-slate-450 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-3.5 py-2 uppercase tracking-wide dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
                    >
                      Salvar Nota
                    </button>
                  </div>
                </form>

                {notes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex justify-between gap-4 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200 dark:border-slate-800"
                      >
                        <div className="space-y-1">
                          <p className="text-xs text-slate-700 dark:text-slate-350">
                            {note.content}
                          </p>
                          <span className="block text-[8px] text-slate-400">
                            Salvo em {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteLessonNote(note.id)}
                          className="text-red-500 hover:text-red-700 shrink-0 self-start p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SEÇÃO DE COMENTÁRIOS DA LIÇÃO */}
              <div className="space-y-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-900 dark:text-blue-400" /> Discussão
                  da Lição ({comments.length})
                </h3>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Deixe uma pergunta, contribuição ou saudação..."
                    className="flex-1 rounded-xl border border-slate-250 bg-white py-2 px-3 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-4 py-2 uppercase tracking-wide dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
                  >
                    Comentar
                  </button>
                </form>

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-450 italic text-center py-4">
                      Nenhum comentário nesta lição ainda. Seja o primeiro a participar!
                    </p>
                  ) : (
                    comments.map((com) => {
                      const hasLiked = com.liked_by.includes(currentUser.id);
                      return (
                        <div
                          key={com.id}
                          className="bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-4 border border-slate-200 dark:border-slate-850 flex gap-3"
                        >
                          <div className="h-7 w-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {com.user_name[0]}
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-bold text-slate-850 dark:text-slate-200">
                                  {com.user_name}
                                </span>
                                <span className="text-[8px] font-bold bg-slate-200/50 dark:bg-slate-800 px-1 rounded text-slate-500 uppercase tracking-tight">
                                  {com.user_role}
                                </span>
                              </div>
                              <span className="text-[8px] text-slate-400">
                                {new Date(com.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-400">
                              {com.content}
                            </p>

                            <div className="flex items-center gap-3 pt-1 text-[10px] font-bold">
                              <button
                                onClick={() => toggleCommentLike(com.id, currentUser.id)}
                                className={`flex items-center gap-1 ${hasLiked ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
                              >
                                <Heart className={`h-3 w-3 ${hasLiked ? "fill-current" : ""}`} />
                                <span>{com.likes}</span>
                              </button>

                              {currentUser.role === "teacher" && (
                                <button
                                  onClick={() => deleteComment(com.id)}
                                  className="text-red-500 hover:text-red-700 ml-auto text-[9px]"
                                >
                                  Excluir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* CONTROLES DE NAVEGAÇÃO */}
              <nav className="mt-16 flex items-center justify-between gap-4 border-t border-slate-200/80 pt-6 dark:border-slate-850">
                {prev ? (
                  <Link
                    to="/lesson/$lessonId"
                    params={{ lessonId: prev.lesson.id }}
                    className="group flex-1 rounded-lg border border-slate-250 p-4 text-left transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
                  >
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      ← Anterior
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
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
                    className="group flex-1 rounded-lg border border-slate-250 p-4 text-right transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
                  >
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Próxima →
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
                      {next.lesson.title}
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                              ? "font-bold text-blue-900 dark:text-blue-400 border-l-2 border-blue-900 dark:border-blue-400 -ml-[1px]"
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
