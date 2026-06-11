import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, Menu } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useLmsStore } from "@/hooks/useLmsStore";
import { slugify } from "@/components/MarkdownRenderer";

// Subcomponentes modulares da lição
import { LessonSidebar } from "@/components/lesson/LessonSidebar";
import { LessonMedia } from "@/components/lesson/LessonMedia";
import { LessonReader } from "@/components/lesson/LessonReader";
import { LessonFeedback } from "@/components/lesson/LessonFeedback";
import { LessonQuizzes } from "@/components/lesson/LessonQuizzes";
import { LessonAITutor } from "@/components/lesson/LessonAITutor";
import { LessonNotes } from "@/components/lesson/LessonNotes";
import { LessonComments } from "@/components/lesson/LessonComments";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { LessonTOC } from "@/components/lesson/LessonTOC";

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
    getLessonNotes,
    addLessonNote,
    deleteLessonNote,
    submitSelfAssessment,
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

  // Preferências de leitura
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");
  const [readingTheme, setReadingTheme] = useState<"light" | "sepia" | "dark">("light");

  // Estados locais dos formulários
  const [newNote, setNewNote] = useState("");
  const [newComment, setNewComment] = useState("");

  // Estados de autoavaliação
  const [compRating, setCompRating] = useState<number>(5);
  const [confRating, setConfRating] = useState<number>(5);
  const [isClarityGood, setIsClarityGood] = useState<boolean>(true);
  const [isAssessmentSubmitted, setIsAssessmentSubmitted] = useState<boolean>(false);

  // Estados do Tutor IA
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

  const { course, module, lesson, prev, next } = data || {};
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

  // Extrair cabeçalhos do markdown com segurança
  const headings = useMemo(() => {
    return lesson?.content ? extractHeadings(lesson.content) : [];
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

  // Guardas de carregamento e existência de dados
  if (!currentUser || !data || !course || !lesson) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-serif text-2xl text-slate-800 dark:text-slate-200">Lição não encontrada</h1>
          <Link
            to="/dashboard"
            className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400 hover:underline"
          >
            ← Voltar à biblioteca
          </Link>
        </div>
      </Layout>
    );
  }

  // Ações da página
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
    setOpenModules((prevMap) => ({ ...prevMap, [modId]: !prevMap[modId] }));
  };

  const handleToggleCompletion = () => {
    toggleLessonProgress(currentUser.id, lesson.id);
  };

  const handleOptionSelect = (quizId: string, optionIdx: number) => {
    const savedAnswer = getQuizAnswer(currentUser.id, quizId);
    if (savedAnswer || justSubmitted[quizId]) return;
    setSelectedOptions((prevMap) => ({ ...prevMap, [quizId]: optionIdx }));
  };

  const handleAnswerSubmit = (quiz: any) => {
    const selectedIdx = selectedOptions[quiz.id];
    if (selectedIdx === undefined) return;
    const isCorrect = selectedIdx === quiz.correct_option_index;
    submitQuizAnswer(currentUser.id, quiz.id, selectedIdx, isCorrect);
    setJustSubmitted((prevMap) => ({ ...prevMap, [quiz.id]: true }));

    submitQuizAttempt(currentUser.id, lesson.id, isCorrect ? 100 : 0, 1, isCorrect, {
      [quiz.id]: selectedIdx,
    });
  };

  const handleVote = (optionIdx: number) => {
    if (poll) {
      submitPollVote(poll.id, currentUser.id, optionIdx);
    }
  };

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

  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSelfAssessment(currentUser.id, lesson.id, compRating, confRating, isClarityGood);
    setIsAssessmentSubmitted(true);
  };

  const handleAiTutorQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    const answer = await sendTutorMessage(lesson.content, aiPrompt);
    setAiResponse(answer);
    setIsAiLoading(false);
    setAiPrompt("");
  };

  // Queries derivadas do store
  const progressRecord = getLessonProgress(currentUser.id, lesson.id);
  const isLessonCompleted = !!progressRecord?.is_completed;
  const quizzes = getLessonQuizzes(lesson.id);
  const poll = getPollByLesson(lesson.id);
  const userVote = poll ? getUserPollVote(poll.id, currentUser.id) : null;
  const notes = getLessonNotes(currentUser.id, lesson.id);
  const comments = getComments("lesson", lesson.id);

  return (
    <Layout>
      <div
        className={`flex min-h-[calc(100vh-4rem)] ${
          readingTheme === "sepia"
            ? "sepia bg-[#f4ecd8]"
            : readingTheme === "dark"
              ? "dark bg-slate-950 text-slate-100"
              : "bg-white text-slate-800"
        } transition-colors`}
      >
        {/* SIDEBAR ESQUERDA: Ementa do Curso */}
        <LessonSidebar
          course={course}
          currentLesson={lesson}
          currentUser={currentUser}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          openModules={openModules}
          toggleModuleCollapse={toggleModuleCollapse}
          getCourseModules={getCourseModules}
          getModuleLessons={getModuleLessons}
          getLessonProgress={getLessonProgress}
        />

        {/* CONTAINER PRINCIPAL */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Barra superior de controles */}
          <div className="sticky top-16 z-20 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 px-6 py-2.5 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900 cursor-pointer"
            >
              <Menu className="h-3.5 w-3.5" />
              <span>{isSidebarOpen ? "Recolher Ementa" : "Ver Ementa"}</span>
            </button>

            {/* Opções de Leitura Kindle-Style */}
            <div className="flex items-center gap-3">
              {/* Tamanho da Fonte */}
              <div className="flex items-center border border-slate-250 dark:border-slate-750 rounded-lg overflow-hidden bg-white dark:bg-slate-900 text-[10px] font-bold">
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-2 py-1.5 border-r border-slate-200 dark:border-slate-800 cursor-pointer ${
                    fontSize === "sm" ? "bg-slate-100 dark:bg-slate-800 text-blue-900 dark:text-blue-400" : "text-slate-500"
                  }`}
                  title="Fonte Menor"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize("md")}
                  className={`px-2.5 py-1.5 border-r border-slate-200 dark:border-slate-800 cursor-pointer ${
                    fontSize === "md" ? "bg-slate-100 dark:bg-slate-800 text-blue-900 dark:text-blue-400" : "text-slate-500"
                  }`}
                  title="Fonte Padrão"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-2.5 py-1.5 border-r border-slate-200 dark:border-slate-800 cursor-pointer ${
                    fontSize === "lg" ? "bg-slate-100 dark:bg-slate-800 text-blue-900 dark:text-blue-400" : "text-slate-500"
                  }`}
                  title="Fonte Grande"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize("xl")}
                  className={`px-2 py-1.5 cursor-pointer ${
                    fontSize === "xl" ? "bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-400" : "text-slate-500"
                  }`}
                  title="Fonte Gigante"
                >
                  A++
                </button>
              </div>

              {/* Tema de Cores de Leitura */}
              <div className="flex items-center border border-slate-250 dark:border-slate-750 rounded-lg overflow-hidden bg-white dark:bg-slate-900 p-0.5">
                <button
                  onClick={() => setReadingTheme("light")}
                  className={`h-5 w-5 rounded-md bg-white border border-slate-200 dark:border-slate-800 cursor-pointer ${
                    readingTheme === "light" ? "ring-2 ring-blue-900" : ""
                  }`}
                  title="Tema Claro"
                />
                <button
                  onClick={() => setReadingTheme("sepia")}
                  className={`h-5 w-5 rounded-md ml-1 bg-[#f4ecd8] border border-[#dcd1b5] cursor-pointer ${
                    readingTheme === "sepia" ? "ring-2 ring-amber-800" : ""
                  }`}
                  title="Tema Sepia"
                />
                <button
                  onClick={() => setReadingTheme("dark")}
                  className={`h-5 w-5 rounded-md ml-1 bg-slate-950 border border-slate-850 cursor-pointer ${
                    readingTheme === "dark" ? "ring-2 ring-blue-400" : ""
                  }`}
                  title="Tema Escuro"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-5xl w-full px-6 py-8 lg:grid lg:grid-cols-[1fr_240px] lg:gap-12 flex-1">
            {/* CONTEÚDO PRINCIPAL DO ARTIGO */}
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
                <h1 className="font-serif text-3xl font-bold tracking-tight leading-tight text-slate-900 dark:text-slate-100">
                  {lesson.title}
                </h1>

                {/* Tempo Estimado */}
                <div className="flex items-center gap-2.5 text-xs text-slate-450 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>⏱️ {lesson.estimated_reading_time || 5} min de leitura confortável</span>
                </div>
              </div>

              {/* MÍDIA (Vídeo, Áudio, PDF) */}
              <LessonMedia
                contentType={lesson.content_type}
                mediaUrl={lesson.media_url}
                transcript={lesson.transcript}
                pdfUrl={lesson.pdf_url}
              />

              {/* RENDERIZADOR DE TEXTO */}
              <LessonReader
                content={lesson.content}
                fontSize={fontSize}
                readingTheme={readingTheme}
              />

              {/* AUTOAVALIAÇÃO & ENQUETES */}
              <LessonFeedback
                isLessonCompleted={isLessonCompleted}
                onToggleCompletion={handleToggleCompletion}
                poll={poll}
                userVote={userVote}
                onVote={handleVote}
                isAssessmentSubmitted={isAssessmentSubmitted}
                onAssessmentSubmit={handleAssessmentSubmit}
                compRating={compRating}
                setCompRating={setCompRating}
                confRating={confRating}
                setConfRating={setConfRating}
                isClarityGood={isClarityGood}
                setIsClarityGood={setIsClarityGood}
              />

              {/* EXERCÍCIOS / QUIZZES */}
              <LessonQuizzes
                quizzes={quizzes}
                currentUser={currentUser}
                selectedOptions={selectedOptions}
                onOptionSelect={handleOptionSelect}
                justSubmitted={justSubmitted}
                onSubmitAnswer={handleAnswerSubmit}
                getQuizAnswer={getQuizAnswer}
              />

              {/* TUTOR IA */}
              <LessonAITutor
                onSubmitQuery={handleAiTutorQuery}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                aiResponse={aiResponse}
                isAiLoading={isAiLoading}
              />

              {/* ANOTAÇÕES PESSOAIS */}
              <LessonNotes
                notes={notes}
                newNote={newNote}
                setNewNote={setNewNote}
                onAddNote={handleAddNote}
                onDeleteNote={deleteLessonNote}
              />

              {/* COMENTÁRIOS / DISCUSSÃO */}
              <LessonComments
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                onAddComment={handleAddComment}
                onToggleLike={(commentId) => toggleCommentLike(commentId, currentUser.id)}
                onDeleteComment={deleteComment}
                currentUser={currentUser}
              />

              {/* NAVEGAÇÃO ENTRE LIÇÕES */}
              <LessonNavigation prev={prev} next={next} />
            </main>

            {/* SIDEBAR DIREITA: SUMÁRIO (TOC) */}
            <LessonTOC
              headings={headings}
              activeHeadingId={activeHeadingId}
              onHeadingClick={handleHeadingClick}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
